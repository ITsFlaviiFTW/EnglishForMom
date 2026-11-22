import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '@/constants/theme';
import { assessPronunciation, PronunciationCheckError } from '@/services/pronunciation-service';

import { evaluatePronunciation, type PronunciationVerdict, type SpokenWord } from './pronunciation';
import { MicrophoneError, startRecording, type ActiveRecording } from './recorder';
import { canSkipSpeaking, type SpeakingOutcome } from './speaking-gate';

type Phase = 'idle' | 'starting' | 'listening' | 'checking';
type Message = { tone: 'good' | 'retry' | 'info'; text: string };

type SpeakCheckProps = {
  text: string;
  outcome: SpeakingOutcome | undefined;
  onResult: (result: 'passed' | 'retry' | 'unavailable') => void;
  onSkip: () => void;
  /** Stops lesson audio, so the microphone does not hear it. */
  onBeforeRecord: () => void;
};

/**
 * "Acum spune tu": she taps the microphone, says the word or sentence, and the
 * app checks it. Continue unlocks once she says it right; after
 * MAX_SPEAKING_ATTEMPTS tries she may skip it, and it goes to review.
 */
export function SpeakCheck({ text, outcome, onResult, onSkip, onBeforeRecord }: SpeakCheckProps) {
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

  const passed = outcome?.status === 'passed';
  const skipped = outcome?.status === 'skipped';

  const attempt = async () => {
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
      setMessage(messageFor(result, passed));
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

  const onPress = () => {
    if (phase === 'listening') {
      recording.current?.stop();
    } else if (phase === 'idle') {
      void attempt();
    }
  };

  const listening = phase === 'listening';
  const working = phase === 'starting' || phase === 'checking';
  const buttonTitle = {
    idle: passed || skipped ? 'Mai spune o dată' : outcome?.attempts ? 'Încearcă din nou' : 'Apasă și vorbește',
    starting: 'Pornesc microfonul…',
    listening: 'Gata',
    checking: 'Verific…',
  }[phase];

  return (
    <View style={styles.section}>
      <Text style={styles.title}>🎤 Acum spune tu</Text>
      {!passed && phase === 'idle' && !message ? (
        <Text style={styles.hint}>Ascultă, apoi apasă butonul și spune cu voce tare.</Text>
      ) : null}

      <Pressable
        accessibilityLabel={listening ? 'Gata, am terminat de vorbit' : `Apasă și spune: ${text}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: working, busy: working }}
        disabled={working}
        onPress={onPress}>
        {({ pressed }) => (
          <View
            style={[
              styles.micButton,
              (passed || skipped) && !listening && styles.micButtonSoft,
              listening && styles.micButtonListening,
              working && styles.micButtonWorking,
              pressed && styles.micButtonPressed,
            ]}>
            <Text style={styles.micIcon}>{listening ? '⏹' : '🎤'}</Text>
            <Text
              style={[
                styles.micText,
                (passed || skipped) && !listening && !working && styles.micTextSoft,
              ]}>
              {buttonTitle}
            </Text>
          </View>
        )}
      </Pressable>

      {listening ? (
        <Text accessibilityLiveRegion="polite" style={styles.listeningText}>
          {heardVoice
            ? 'Te aud… Când termini, așteaptă puțin sau apasă „Gata”.'
            : 'Te ascult… Vorbește acum.'}
        </Text>
      ) : null}

      {verdict && phase === 'idle' ? <SpokenWords words={verdict.words} /> : null}

      {message && phase === 'idle' ? (
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
      ) : null}

      {canSkipSpeaking(outcome) && phase === 'idle' ? (
        <View style={styles.skipArea}>
          <Text style={styles.skipText}>
            Nu-i nimic. Poți merge mai departe; vei exersa din nou la „Repetă”.
          </Text>
          <Pressable accessibilityRole="button" onPress={onSkip}>
            {({ pressed }) => (
              <View style={[styles.skipButton, pressed && styles.skipButtonPressed]}>
                <Text style={styles.skipButtonText}>Sari peste, deocamdată</Text>
              </View>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

/** The phrase as written: green words said well, red ones to practise. */
function SpokenWords({ words }: { words: readonly SpokenWord[] }) {
  return (
    <View style={styles.words}>
      {words.map((word, index) => {
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

function messageFor(verdict: PronunciationVerdict, alreadyPassed: boolean): Message {
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
      text: someRed
        ? '✓ Bine! Ai trecut. Mai exersează cuvintele cu roșu.'
        : '✓ Foarte bine! Ai spus corect.',
    };
  }
  return {
    tone: alreadyPassed ? 'info' : 'retry',
    text: someRed
      ? 'Încă puțin! Cuvintele cu roșu au nevoie de exercițiu. Ascultă din nou și repetă.'
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
  section: {
    gap: 10,
    borderRadius: radii.medium,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
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
  micButtonSoft: {
    backgroundColor: colors.warmSoft,
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
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
  micTextSoft: {
    color: colors.warm,
  },
  listeningText: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
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
    padding: 12,
    backgroundColor: colors.surface,
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
  },
  messageTextGood: {
    color: colors.success,
    fontWeight: '700',
  },
  messageTextRetry: {
    color: colors.error,
    fontWeight: '600',
  },
  skipArea: {
    gap: 8,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  skipButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  skipButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  skipButtonText: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
});
