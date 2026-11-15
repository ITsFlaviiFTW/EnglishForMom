import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { ProgressBar } from '@/components/progress-bar';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors, radii } from '@/constants/theme';
import { AudioControls } from '@/features/audio/listen-button';
import { useAudioPlayback } from '@/features/audio/use-audio-playback';
import { findReviewItemAudio } from '@/features/review/review-audio';
import { getDueReviewCount, prioritizeReviewItems } from '@/features/review/review-queue';
import { useLearningProgress } from '@/hooks/use-learning-progress';
import { lessonAudioService } from '@/services/lesson-audio-service';
import type { ReviewItemProgress } from '@/types';

type ReviewSession = {
  itemIds: readonly string[];
  currentIndex: number;
  revealed: boolean;
  correctAnswers: number;
  incorrectAnswers: number;
  completed: boolean;
};

export default function ReviewScreen() {
  const { progress, isLoading, saveError, answerReview } = useLearningProgress();
  const [session, setSession] = useState<ReviewSession | null>(null);
  const dueCount = getDueReviewCount(progress.reviewItems);
  const currentItem = session ? progress.reviewItems[session.itemIds[session.currentIndex]] : null;

  const startSession = () => {
    const items = prioritizeReviewItems(progress.reviewItems);
    setSession({
      itemIds: items.map((item) => item.id),
      currentIndex: 0,
      revealed: false,
      correctAnswers: 0,
      incorrectAnswers: 0,
      completed: items.length === 0,
    });
  };

  const recordAnswer = (correct: boolean) => {
    if (!session || !currentItem) {
      return;
    }

    answerReview(currentItem.id, correct);
    const isLastItem = session.currentIndex >= session.itemIds.length - 1;
    setSession({
      ...session,
      currentIndex: isLastItem ? session.currentIndex : session.currentIndex + 1,
      revealed: false,
      correctAnswers: session.correctAnswers + (correct ? 1 : 0),
      incorrectAnswers: session.incorrectAnswers + (correct ? 0 : 1),
      completed: isLastItem,
    });
  };

  const inQuestion = Boolean(session && !session.completed && currentItem);

  return (
    <ScreenContainer
      footer={
        inQuestion && session && !session.revealed ? (
          <ActionButton
            onPress={() => setSession({ ...session, revealed: true })}
            title="Arată răspunsul"
          />
        ) : undefined
      }>
      <ScreenHeader
        title="Repetă"
        description="Cuvintele la care ai greșit revin aici, până le știi."
      />

      {isLoading ? (
        <AppCard title="Se încarcă…" />
      ) : session?.completed ? (
        <ReviewComplete dueCount={dueCount} onRestart={startSession} session={session} />
      ) : session && currentItem ? (
        <ReviewQuestion
          key={currentItem.id}
          item={currentItem}
          onAnswer={recordAnswer}
          position={session.currentIndex + 1}
          revealed={session.revealed}
          total={session.itemIds.length}
        />
      ) : dueCount > 0 ? (
        <AppCard>
          <View style={styles.dueRow}>
            <Text style={styles.dueNumber}>{dueCount}</Text>
            <Text style={styles.dueLabel}>
              {dueCount === 1 ? 'cuvânt de repetat' : 'cuvinte de repetat'}
            </Text>
          </View>
          <Text style={styles.message}>
            Vei vedea câte un cuvânt. Încearcă să-ți amintești răspunsul, apoi apasă „Arată
            răspunsul”.
          </Text>
          <View style={styles.startButton}>
            <ActionButton onPress={startSession} title="Începe repetarea" />
          </View>
        </AppCard>
      ) : (
        <View style={styles.emptyState}>
          <AppCard
            title="Nimic de repetat acum 👍"
            description="Când greșești un răspuns într-o lecție, cuvântul apare aici automat."
          />
          <AppButton href="/lessons" icon="📚" title="Mergi la lecții" />
        </View>
      )}

      {saveError ? <Text style={styles.error}>{saveError}</Text> : null}
    </ScreenContainer>
  );
}

function ReviewQuestion({
  item,
  position,
  total,
  revealed,
  onAnswer,
}: {
  item: ReviewItemProgress;
  position: number;
  total: number;
  revealed: boolean;
  onAnswer: (correct: boolean) => void;
}) {
  const audioPlayback = useAudioPlayback(lessonAudioService, item.id);
  const audio = findReviewItemAudio(item);
  const askForRomanian = (item.correctAttempts + item.incorrectAttempts) % 2 === 1;
  const prompt = askForRomanian ? item.content.english : item.content.romanian;
  const instruction = askForRomanian ? 'Ce înseamnă în română?' : 'Cum se spune în engleză?';

  return (
    <View style={styles.session}>
      <View style={styles.progressRow}>
        <ProgressBar
          accessibilityLabel={`Cuvântul ${position} din ${total}`}
          max={total}
          style={styles.progressBar}
          value={position}
        />
        <Text style={styles.progressCount}>
          {position}/{total}
        </Text>
      </View>

      <AppCard eyebrow={instruction}>
        <Text style={styles.prompt}>{prompt}</Text>
        {askForRomanian && audio ? (
          <AudioControls
            errorMessage={audioPlayback.errorMessage}
            label={item.content.english}
            onPlay={(source, options) => void audioPlayback.play(source, options)}
            size="compact"
            source={audio}
            state={audioPlayback.state}
          />
        ) : null}

        {revealed ? (
          <View accessibilityLiveRegion="polite" style={styles.answerArea}>
            <View style={styles.translationBlock}>
              <Text style={styles.english}>{item.content.english}</Text>
              <Text style={styles.romanian}>{item.content.romanian}</Text>
            </View>
            {!askForRomanian && audio ? (
              <AudioControls
                errorMessage={audioPlayback.errorMessage}
                label={item.content.english}
                onPlay={(source, options) => void audioPlayback.play(source, options)}
                size="compact"
                source={audio}
                state={audioPlayback.state}
              />
            ) : null}
            {item.example ? (
              <View style={styles.exampleBlock}>
                <Text style={styles.exampleEnglish}>{item.example.english}</Text>
                <Text style={styles.exampleRomanian}>{item.example.romanian}</Text>
              </View>
            ) : null}
            <Text style={styles.selfCheck}>Ai știut?</Text>
            <View style={styles.answerButtons}>
              <SelfCheckButton label="Da, am știut" onPress={() => onAnswer(true)} positive />
              <SelfCheckButton label="Nu încă" onPress={() => onAnswer(false)} positive={false} />
            </View>
          </View>
        ) : null}
      </AppCard>
    </View>
  );
}

function SelfCheckButton({
  label,
  positive,
  onPress,
}: {
  label: string;
  positive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.selfCheckButton,
        positive ? styles.positiveButton : styles.notYetButton,
        pressed && styles.selfCheckPressed,
      ]}>
      <Text style={[styles.selfCheckText, !positive && styles.notYetText]}>{label}</Text>
    </Pressable>
  );
}

function ReviewComplete({
  session,
  dueCount,
  onRestart,
}: {
  session: ReviewSession;
  dueCount: number;
  onRestart: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <AppCard
        eyebrow="Gata!"
        title="Foarte bine, ai terminat repetarea."
        description={`Ai știut ${session.correctAnswers} din ${session.correctAnswers + session.incorrectAnswers}. Cuvintele pe care nu le-ai știut vor reveni.`}>
        {dueCount > 0 ? (
          <ActionButton onPress={onRestart} title="Mai repetă o dată" variant="secondary" />
        ) : null}
      </AppCard>
      <AppButton href="/" icon="🏠" title="Acasă" />
    </View>
  );
}

const styles = StyleSheet.create({
  dueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  dueNumber: {
    color: colors.warm,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
  },
  dueLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '700',
  },
  message: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 27,
    marginTop: 8,
  },
  startButton: {
    marginTop: 20,
  },
  emptyState: {
    gap: 16,
  },
  session: {
    gap: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
  },
  progressCount: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  prompt: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '800',
    marginBottom: 16,
  },
  answerArea: {
    gap: 16,
    marginTop: 16,
  },
  translationBlock: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.medium,
    padding: 16,
    gap: 4,
  },
  english: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
  },
  romanian: {
    color: colors.primary,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
  },
  exampleBlock: {
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
    paddingLeft: 12,
    gap: 4,
  },
  exampleEnglish: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '600',
  },
  exampleRomanian: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 25,
  },
  selfCheck: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '800',
    marginTop: 4,
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  selfCheckButton: {
    flex: 1,
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    paddingHorizontal: 12,
  },
  positiveButton: {
    backgroundColor: colors.success,
  },
  notYetButton: {
    backgroundColor: colors.surface,
    borderColor: colors.warm,
    borderWidth: 2,
  },
  selfCheckPressed: {
    opacity: 0.85,
  },
  selfCheckText: {
    color: colors.onPrimary,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800',
    textAlign: 'center',
  },
  notYetText: {
    color: colors.warm,
  },
  error: {
    color: colors.error,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
  },
});
