import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { AppCard } from '@/components/app-card';
import { Meaning } from '@/components/meaning';
import { ScreenContainer } from '@/components/screen-container';
import { colors, radii } from '@/constants/theme';
import { AudioControls, ReadAs } from '@/features/audio/listen-button';
import { useAudioPlayback } from '@/features/audio/use-audio-playback';
import { countRo, getDictationSentences, type DictationSentence } from '@/features/lessons/lesson-redo';
import { LessonTopBar } from '@/features/lessons/lesson-top-bar';
import { RedoDone } from '@/features/lessons/redo-done';
import type { AudioService } from '@/services/audio-service';
import type { Lesson } from '@/types';

/**
 * The dictation for the workbook's "4. Dictare" page: each sentence plays in
 * English with the text hidden, and only the Romanian meaning shows. She
 * writes it on her page, taps "Arată propoziția" and checks. "Nu chiar" sends
 * the sentence to "Repetă"; nothing else is saved.
 */
export function DictationPlayer({
  lesson,
  audioService,
  onMissed,
}: {
  lesson: Lesson;
  audioService: AudioService;
  onMissed: (sentence: DictationSentence) => void;
}) {
  const [sentences] = useState(() => getDictationSentences(lesson));
  const [index, setIndex] = useState(0);
  const [missed, setMissed] = useState(0);
  const sentence = sentences[index];

  if (!sentence) {
    return (
      <RedoDone
        detail={
          missed === 0
            ? undefined
            : missed === 1
              ? 'O propoziție va reveni la „Repetă”, ca s-o mai exersezi.'
              : `${countRo(missed, 'propoziție', 'propoziții')} vor reveni la „Repetă”, ca să le mai exersezi.`
        }
        lessonId={lesson.id}
        message={`Ai scris toate cele ${sentences.length} propoziții.`}
      />
    );
  }

  return (
    <DictationStep
      // A new sentence starts fresh: hidden, scrolled to the top, its sound by itself.
      key={sentence.number}
      audioService={audioService}
      lesson={lesson}
      onNext={(wrong) => {
        if (wrong) {
          onMissed(sentence);
          setMissed((count) => count + 1);
        }
        setIndex((current) => current + 1);
      }}
      sentence={sentence}
      total={sentences.length}
    />
  );
}

function DictationStep({
  lesson,
  sentence,
  total,
  audioService,
  onNext,
}: {
  lesson: Lesson;
  sentence: DictationSentence;
  total: number;
  audioService: AudioService;
  onNext: (wrong: boolean) => void;
}) {
  const [shown, setShown] = useState(false);
  // Showing the sentence stops the sound (a new key), like moving to a new card.
  const audioPlayback = useAudioPlayback(
    audioService,
    `${lesson.id}:dictation:${sentence.number}:${shown ? 'shown' : 'hidden'}`,
  );

  return (
    <ScreenContainer
      header={<LessonTopBar position={sentence.number} total={total} />}
      footer={
        shown ? (
          <View style={styles.footer}>
            <Text style={styles.footerAsk}>Ai scris la fel?</Text>
            <View style={styles.answers}>
              <ActionButton
                accessibilityLabel="Da, am scris la fel"
                onPress={() => onNext(false)}
                style={styles.answer}
                title="👍 Da"
              />
              <ActionButton
                accessibilityLabel="Nu chiar. Propoziția va reveni la Repetă."
                onPress={() => onNext(true)}
                style={styles.answer}
                title="✏️ Nu chiar"
                variant="warm"
              />
            </View>
          </View>
        ) : (
          <ActionButton onPress={() => setShown(true)} title="👀 Arată propoziția" />
        )
      }>
      <Text style={styles.lessonTitle}>Dictare · {lesson.title.romanian}</Text>
      <View style={styles.cardArea}>
        <AppCard eyebrow={`Propoziția ${sentence.number} · rândul ${sentence.number} din caiet`}>
          {shown ? (
            <>
              <Text style={styles.english}>{sentence.english}</Text>
              <ReadAs source={sentence.audio} style={styles.readAs} />
              <Meaning style={styles.meaning} text={sentence.romanian} />
              <View style={styles.check}>
                <Text style={styles.checkText}>
                  Uită-te la ce ai scris. Dacă e altfel, corectează cu altă culoare.
                </Text>
              </View>
            </>
          ) : (
            <>
              <View accessibilityLabel="Propoziția în engleză e ascunsă" accessible style={styles.hidden}>
                <Text style={styles.hiddenIcon}>✍️</Text>
                <Text style={styles.hiddenText}>Ascultă și scrie în caiet</Text>
              </View>
              <Text style={styles.hintLabel}>Înseamnă:</Text>
              <Meaning style={styles.hint} text={sentence.romanian} />
              {sentence.audio ? (
                <View style={styles.audioArea}>
                  <AudioControls
                    autoPlay
                    errorMessage={audioPlayback.errorMessage}
                    label="propoziția"
                    onPlay={(source, options) => audioPlayback.play(source, options)}
                    onStop={() => void audioPlayback.stop()}
                    showReadAs={false}
                    showWords={false}
                    source={sentence.audio}
                    state={audioPlayback.state}
                    voice="english"
                  />
                </View>
              ) : null}
            </>
          )}
        </AppCard>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lessonTitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    marginTop: 6,
  },
  cardArea: {
    paddingTop: 14,
    paddingBottom: 8,
  },
  hidden: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: radii.medium,
    padding: 12,
  },
  hiddenIcon: {
    fontSize: 30,
    lineHeight: 36,
  },
  hiddenText: {
    color: colors.textMuted,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  hintLabel: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    marginTop: 18,
  },
  hint: {
    marginTop: 4,
  },
  audioArea: {
    marginTop: 22,
  },
  english: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 39,
    fontWeight: '800',
  },
  readAs: {
    marginTop: 8,
  },
  meaning: {
    marginTop: 16,
  },
  check: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.medium,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 18,
  },
  checkText: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '600',
  },
  footer: {
    gap: 10,
  },
  footerAsk: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  answers: {
    flexDirection: 'row',
    gap: 10,
  },
  answer: {
    flex: 1,
    paddingHorizontal: 8,
  },
});
