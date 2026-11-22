import { Platform } from 'react-native';

import { SPEECH_SAMPLE_RATE, downsampleToPcm16, encodeWav } from './wav';

/** Samples per chunk; about 85 ms at 48 kHz. */
const CHUNK_SIZE = 4096;
/** The first chunks measure the room's background noise. */
const NOISE_CHUNKS = 3;
/** Stop this long after she stops talking (a beginner pauses between words). */
const SILENCE_AFTER_SPEECH_SECONDS = 1.8;
/** Give up if she has not started talking by then. */
const NO_SPEECH_SECONDS = 7;
const MAX_SECONDS = 15;
/** Kept before the first and after the last loud chunk, so no sound is cut off. */
const LEAD_CHUNKS = 3;
const TAIL_CHUNKS = 5;

export type RecordingResult = {
  /** 16 kHz mono WAV, trimmed to the part where she spoke. */
  wav: Uint8Array;
  /** False when nothing louder than the background was heard. */
  heardSpeech: boolean;
};

export type ActiveRecording = {
  /** "Gata": stop now and keep what was recorded. */
  stop: () => void;
  /** Stop and throw the recording away (the step was left). */
  cancel: () => void;
  result: Promise<RecordingResult | null>;
};

export class MicrophoneError extends Error {
  constructor(readonly reason: 'denied' | 'missing' | 'failed') {
    super(`Microphone ${reason}`);
  }
}

type AudioContextConstructor = typeof AudioContext;

function getAudioContextClass(): AudioContextConstructor | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext
  );
}

export function isRecordingSupported(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    getAudioContextClass() !== undefined
  );
}

/**
 * Records from the microphone until she stops talking, taps "Gata", or a
 * time limit passes. The microphone is released as soon as recording ends, so
 * the phone's speaker goes back to full volume for the next playback.
 */
export async function startRecording(
  options: { onSpeechStart?: () => void } = {},
): Promise<ActiveRecording> {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass || !navigator.mediaDevices?.getUserMedia) {
    throw new MicrophoneError('missing');
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch (error) {
    const name = error instanceof Error ? error.name : '';
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      throw new MicrophoneError('denied');
    }
    throw new MicrophoneError(name === 'NotFoundError' ? 'missing' : 'failed');
  }

  const context = new AudioContextClass();
  try {
    await context.resume();
  } catch {
    // Safari may already be running; any real problem shows up as silence.
  }
  const input = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(CHUNK_SIZE, 1, 1);
  // The processor only runs while connected to the output; a muted gain keeps
  // the microphone out of the speaker.
  const mute = context.createGain();
  mute.gain.value = 0;
  input.connect(processor);
  processor.connect(mute);
  mute.connect(context.destination);

  const chunkSeconds = CHUNK_SIZE / context.sampleRate;
  const chunks: Float32Array[] = [];
  let noiseFloor = 0;
  let loudRun = 0;
  let speechStart = -1;
  let lastSpeech = -1;
  let finished = false;
  let resolveResult: (result: RecordingResult | null) => void = () => {};
  const result = new Promise<RecordingResult | null>((resolve) => {
    resolveResult = resolve;
  });

  const release = () => {
    processor.onaudioprocess = null;
    input.disconnect();
    processor.disconnect();
    mute.disconnect();
    for (const track of stream.getTracks()) {
      track.stop();
    }
    void context.close().catch(() => undefined);
  };

  const finish = (mode: 'auto' | 'manual' | 'cancel') => {
    if (finished) {
      return;
    }
    finished = true;
    release();
    if (mode === 'cancel') {
      resolveResult(null);
      return;
    }

    const heardSpeech = speechStart >= 0;
    if (!heardSpeech && mode === 'auto') {
      resolveResult({ wav: new Uint8Array(), heardSpeech: false });
      return;
    }
    // When she taps "Gata" without the level check noticing her (a very quiet
    // voice), the whole recording is sent and the speech service decides.
    const from = heardSpeech ? Math.max(0, speechStart - LEAD_CHUNKS) : 0;
    const to = heardSpeech ? Math.min(chunks.length, lastSpeech + 1 + TAIL_CHUNKS) : chunks.length;
    const pcm = downsampleToPcm16(chunks.slice(from, to), context.sampleRate, SPEECH_SAMPLE_RATE);
    resolveResult({ wav: encodeWav(pcm, SPEECH_SAMPLE_RATE), heardSpeech: true });
  };

  processor.onaudioprocess = (event) => {
    if (finished) {
      return;
    }
    const samples = new Float32Array(event.inputBuffer.getChannelData(0));
    chunks.push(samples);
    const index = chunks.length - 1;

    let sumOfSquares = 0;
    for (const sample of samples) {
      sumOfSquares += sample * sample;
    }
    const level = Math.sqrt(sumOfSquares / samples.length);
    if (index < NOISE_CHUNKS) {
      noiseFloor = (noiseFloor * index + level) / (index + 1);
    }
    const speechLevel = Math.max(0.012, Math.min(noiseFloor * 3, 0.06));

    if (level > speechLevel) {
      loudRun += 1;
      lastSpeech = index;
      if (loudRun >= 2 && speechStart < 0) {
        speechStart = index - 1;
        options.onSpeechStart?.();
      }
    } else {
      loudRun = 0;
    }

    const elapsed = chunks.length * chunkSeconds;
    if (speechStart >= 0 && (index - lastSpeech) * chunkSeconds >= SILENCE_AFTER_SPEECH_SECONDS) {
      finish('auto');
    } else if (speechStart < 0 && elapsed >= NO_SPEECH_SECONDS) {
      finish('auto');
    } else if (elapsed >= MAX_SECONDS) {
      finish('auto');
    }
  };

  return {
    stop: () => finish('manual'),
    cancel: () => finish('cancel'),
    result,
  };
}
