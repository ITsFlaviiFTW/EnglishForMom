import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { colors, radii } from '@/constants/theme';
import { assessPronunciation, PronunciationCheckError } from '@/services/pronunciation-service';

import { evaluatePronunciation, type PronunciationVerdict, type SpokenWord } from './pronunciation';
import { MicrophoneError, startRecording, type ActiveRecording } from './recorder';
import { canSkipSpeaking, type SpeakingOutcome } from './speaking-gate';

type Phase = 'idle' | 'starting' | 'listening' | 'checking';
type Message = { tone: 'good' | 'retry' | 'info'; text: string };

/** What the step asks her to say, and where the result goes. */
export type SpeakCheckConfig = {
  text: string;
  outcome: SpeakingOutcome | undefined;
  onResult: (result: 'passed' | 'retry' | 'unavailable') => void;
  /** Stops lesson audio, so the microphone does not hear it. */
  onBeforeRecord: () => void;
};

export type SpeakCheck = {
  text: string;
  outcome: SpeakingOutcome | undefined;
  phase: Phase;
  heardVoice: boolean;
  /** Her last try, word by word (green said well, red to practise). */
  verdict: PronunciationVerdict | null;
  message: Message | null;
  /** Starts listening, or stops early while listening. */
  press: () => void;
};

/**
 * "Acum spune tu": she taps the big microphone button at the bottom, says the
 * word or sentence, and the app checks it. The step moves on once she says it
 * right; after MAX_SPEAKING_ATTEMPTS tries she may skip it, and it goes to
 * review. Without a step to check (`config` null) it does nothing.
 */
export function useSpeakCheck(config: SpeakCheckConfig | null): SpeakCheck {
  const [phase, setPhase] = useState<Phase>('idle');
  const [heardVoice, setHeardVoice] = useState(false);
  const [verdict, setVerdict] = useState<PronunciationVerdict | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const recording = useRef<ActiveRecording | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      recording.current?.cancel();
    };
  }, []);

  const attempt = async ({ text, onResult, onBeforeRecord }: SpeakCheckConfig) => {
    onBeforeRecord();
    setPhase('starting');
    setHeardVoice(false);
    setMessage(null);
    try {
      const active = await startRecording({ onSpeechStart: () => setHeardVoice(true) });
      if (!mounted.current) {
        active.cancel();
        return;
      }
      recording.current = active;
      setPhase('listening');
      const recorded = await active.result;
      recording.current = null;
      if (!recorded || !mounted.current) {
        return;
      }
      if (!recorded.heardSpeech) {
        setVerdict(null);
        setMessage({
          tone: 'retry',
          text: 'Nu te-am auzit. Vorbește mai tare, cu telefonul aproape de gură.',
        });
        onResult('retry');
        return;
      }

      setPhase('checking');
      const result = evaluatePronunciation(text, await assessPronunciation(recorded.wav, text));
      if (!mounted.current) {
        return;
      }
      setVerdict(result.status === 'not-heard' ? null : result);
      setMessage(messageFor(result));
      onResult(result.status === 'passed' ? 'passed' : 'retry');
    } catch (error) {
      if (!mounted.current) {
        return;
      }
      recording.current = null;
      setVerdict(null);
      setMessage({ tone: 'info', text: problemMessage(error) });
      onResult('unavailable');
    } finally {
      if (mounted.current) {
        setPhase('idle');
      }
    }
  };

  const press = () => {
    if (phase === 'listening') {
      recording.current?.stop();
    } else if (phase === 'idle' && config) {
      void attempt(config);
    }
  };

  return {
    text: config?.text ?? '',
    outcome: config?.outcome,
    phase,
    heardVoice,
    verdict,
    message,
    press,
  };
}

/** On the card, under the buttons: the words of her last try, green or red. */
export function SpokenWords({ check }: { check: SpeakCheck }) {
  if (!check.verdict || check.phase !== 'idle') {
    return null;
  }
  return (
    <View style={styles.words}>
      {check.verdict.words.map((word: SpokenWord, index) => {
        const bad = word.status === 'weak' || word.status === 'missed';
        return (
          <View
            key={`${word.text}-${index}`}
            style={[styles.word, word.status === 'good' && styles.wordGood, bad && styles.wordBad]}>
            <Text
              style={[
                styles.wordText,
                word.status === 'good' && styles.wordTextGood,
                bad && styles.wordTextBad,
              ]}>
              {word.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/** What the app has to say about her try, shown just above the bottom button. */
export function SpeakStatus({ check }: { check: SpeakCheck }) {
  if (check.phase === 'listening') {
    return (
      <Text accessibilityLiveRegion="polite" style={styles.listeningText}>
        {check.heardVoice
          ? 'Te aud… Când termini, așteaptă puțin sau apasă „Gata”.'
          : 'Te ascult… Spune acum, cu voce tare.'}
      </Text>
    );
  }
  const { message } = check;
  if (!message || check.phase !== 'idle') {
    return null;
  }
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.message,
        message.tone === 'good' && styles.messageGood,
        message.tone === 'retry' && styles.messageRetry,
      ]}>
      <Text
        style={[
          styles.messageText,
          message.tone === 'good' && styles.messageTextGood,
          message.tone === 'retry' && styles.messageTextRetry,
        ]}>
        {message.text}
      </Text>
    </View>
  );
}

/**
 * The bottom of a step she has to say: the big microphone button and, after
 * several tries, "Sari peste".
 */
export function SpeakButtons({ check, onSkip }: { check: SpeakCheck; onSkip: () => void }) {
  const { phase, outcome } = check;
  const listening = phase === 'listening';
  const working = phase === 'starting' || phase === 'checking';
  const title = {
    idle: outcome?.attempts ? 'Încearcă din nou' : 'Apasă și spune',
    starting: 'Pornesc microfonul…',
    listening: 'Gata',
    checking: 'Verific…',
  }[phase];

  return (
    <View style={styles.buttons}>
      <Pressable
        accessibilityLabel={listening ? 'Gata, am terminat de vorbit' : `Apasă și spune: ${check.text}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: working, busy: working }}
        disabled={working}
        onPress={check.press}>
        {({ pressed }) => (
          <View
            style={[
              styles.micButton,
              listening && styles.micButtonListening,
              working && styles.micButtonWorking,
              pressed && styles.micButtonPressed,
            ]}>
            <Text style={styles.micIcon}>{listening ? '⏹' : '🎤'}</Text>
            <Text style={styles.micText}>{title}</Text>
          </View>
        )}
      </Pressable>
      {canSkipSpeaking(outcome) && phase === 'idle' ? (
        <ActionButton
          accessibilityLabel="Sari peste, deocamdată. Vei exersa din nou la Repetă."
          onPress={onSkip}
          title="Sari peste, deocamdată"
          variant="secondary"
        />
      ) : null}
    </View>
  );
}

function messageFor(verdict: PronunciationVerdict): Message {
  if (verdict.status === 'not-heard') {
    return {
      tone: 'retry',
      text: 'Nu te-am auzit bine. Vorbește mai tare, cu telefonul aproape de gură.',
    };
  }
  const someRed = verdict.words.some((word) => word.status === 'weak' || word.status === 'missed');
  if (verdict.status === 'passed') {
    return {
      tone: 'good',
      text: someRed ? '✓ Bine! Mai exersează cuvintele cu roșu.' : '✓ Foarte bine!',
    };
  }
  return {
    tone: 'retry',
    text: someRed
      ? 'Încă puțin! Ascultă din nou cuvintele cu roșu și repetă.'
      : 'Încă puțin! Ascultă din nou și repetă, rar și clar.',
  };
}

function problemMessage(error: unknown): string {
  if (error instanceof MicrophoneError) {
    return error.reason === 'denied'
      ? 'Telefonul nu dă voie aplicației să folosească microfonul. Poți continua fără verificare.'
      : 'Microfonul nu merge acum. Poți continua fără verificare.';
  }
  if (error instanceof PronunciationCheckError && error.reason === 'offline') {
    return 'Nu am putut verifica: telefonul nu pare conectat la internet. Poți continua.';
  }
  return 'Verificarea nu merge acum. Poți continua.';
}

const styles = StyleSheet.create({
  buttons: {
    gap: 10,
  },
  micButton: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: radii.medium,
    backgroundColor: colors.warm,
    paddingHorizontal: 14,
  },
  micButtonListening: {
    backgroundColor: colors.error,
  },
  micButtonWorking: {
    backgroundColor: colors.disabled,
  },
  micButtonPressed: {
    opacity: 0.85,
  },
  micIcon: {
    fontSize: 24,
    lineHeight: 30,
  },
  micText: {
    flexShrink: 1,
    color: colors.onPrimary,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
  },
  listeningText: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  word: {
    borderRadius: radii.small,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.surface,
  },
  wordGood: {
    backgroundColor: colors.successSoft,
  },
  wordBad: {
    backgroundColor: colors.errorSoft,
  },
  wordText: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
  wordTextGood: {
    color: colors.success,
  },
  wordTextBad: {
    color: colors.error,
    textDecorationLine: 'underline',
  },
  message: {
    borderRadius: radii.small,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surfaceMuted,
  },
  messageGood: {
    backgroundColor: colors.successSoft,
  },
  messageRetry: {
    backgroundColor: colors.errorSoft,
  },
  messageText: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  messageTextGood: {
    color: colors.success,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '800',
  },
  messageTextRetry: {
    color: colors.error,
    fontWeight: '600',
  },
});
