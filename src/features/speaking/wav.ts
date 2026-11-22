/** The format Azure's short-audio speech recognition expects. */
export const SPEECH_SAMPLE_RATE = 16000;

/**
 * Joins recorded chunks and converts them to 16 kHz, 16-bit samples. Each output
 * sample is the average of the input samples it covers, which also filters out
 * the high frequencies that would otherwise alias when the rate drops.
 */
export function downsampleToPcm16(
  chunks: readonly Float32Array[],
  inputRate: number,
  outputRate: number = SPEECH_SAMPLE_RATE,
): Int16Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const input = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    input.set(chunk, offset);
    offset += chunk.length;
  }

  const ratio = inputRate / outputRate;
  if (ratio < 1) {
    throw new Error(`Cannot raise the sample rate from ${inputRate} to ${outputRate}.`);
  }
  const outputLength = Math.floor(totalLength / ratio);
  const output = new Int16Array(outputLength);
  for (let i = 0; i < outputLength; i += 1) {
    const start = Math.floor(i * ratio);
    const end = Math.min(totalLength, Math.max(start + 1, Math.floor((i + 1) * ratio)));
    let sum = 0;
    for (let j = start; j < end; j += 1) {
      sum += input[j];
    }
    const sample = Math.max(-1, Math.min(1, sum / (end - start)));
    output[i] = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff);
  }
  return output;
}

/** A mono 16-bit PCM WAV file. */
export function encodeWav(samples: Int16Array, sampleRate: number = SPEECH_SAMPLE_RATE): Uint8Array {
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeText = (at: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(at + i, text.charCodeAt(i));
    }
  };

  writeText(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // bytes per second
  view.setUint16(32, 2, true); // bytes per sample frame
  view.setUint16(34, 16, true); // bits per sample
  writeText(36, 'data');
  view.setUint32(40, dataSize, true);
  for (let i = 0; i < samples.length; i += 1) {
    view.setInt16(44 + i * 2, samples[i], true);
  }
  return new Uint8Array(buffer);
}
