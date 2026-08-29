import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/theme';
import {
  getDueReviewCount,
  prioritizeReviewItems,
} from '@/features/review/review-queue';
import { useLearningProgress } from '@/hooks/use-learning-progress';
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

  return (
    <ScreenContainer style={styles.screen}>
      <ScreenHeader
        title="Repetare"
        description="Exersează din nou cuvintele care au nevoie de mai multă atenție."
      />

      <View style={styles.dueBanner}>
        <Text style={styles.dueNumber}>{isLoading ? '—' : dueCount}</Text>
        <Text style={styles.dueLabel}>
          {dueCount === 1 ? 'element de repetat' : 'elemente de repetat'}
        </Text>
      </View>

      {isLoading ? (
        <AppCard title="Se încarcă repetarea…" />
      ) : session?.completed ? (
        <ReviewComplete session={session} dueCount={dueCount} onRestart={startSession} />
      ) : session && currentItem ? (
        <ReviewQuestion
          item={currentItem}
          position={session.currentIndex + 1}
          total={session.itemIds.length}
          revealed={session.revealed}
          onReveal={() => setSession({ ...session, revealed: true })}
          onAnswer={recordAnswer}
        />
      ) : dueCount > 0 ? (
        <AppCard
          eyebrow="Sesiune scurtă"
          title="Hai să repetăm"
          description="Vei vedea cel mult 5 elemente. Încearcă să răspunzi înainte să arăți traducerea.">
          <ActionButton title="Începe repetarea" onPress={startSession} />
        </AppCard>
      ) : (
        <AppCard title="Nimic de repetat acum">
          <Text style={styles.message}>
            Cuvintele și întrebările la care ai răspuns greșit vor apărea aici automat.
          </Text>
        </AppCard>
      )}

      {saveError ? <Text style={styles.error}>{saveError}</Text> : null}
    </ScreenContainer>
  );
}

type ReviewQuestionProps = {
  item: ReviewItemProgress;
  position: number;
  total: number;
  revealed: boolean;
  onReveal: () => void;
  onAnswer: (correct: boolean) => void;
};

function ReviewQuestion({
  item,
  position,
  total,
  revealed,
  onReveal,
  onAnswer,
}: ReviewQuestionProps) {
  const askForRomanian = (item.correctAttempts + item.incorrectAttempts) % 2 === 1;
  const prompt = askForRomanian ? item.content.english : item.content.romanian;
  const instruction = askForRomanian
    ? 'Ce înseamnă în română?'
    : 'Cum spui în engleză?';
  const percent = (position / total) * 100;

  return (
    <View style={styles.session}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Repetare</Text>
        <Text style={styles.progressCount}>
          {position} / {total}
        </Text>
      </View>
      <View
        accessibilityLabel={`Progresul repetării: ${position} din ${total}`}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 1, max: total, now: position }}
        style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>

      <AppCard eyebrow="Gândește-te înainte" title={instruction}>
        <Text style={styles.prompt}>{prompt}</Text>

        {revealed ? (
          <View accessibilityLiveRegion="polite" style={styles.answerArea}>
            <View style={styles.translationBlock}>
              <Text style={styles.english}>{item.content.english}</Text>
              <Text style={styles.romanian}>{item.content.romanian}</Text>
            </View>
            {item.example ? (
              <View style={styles.exampleBlock}>
                <Text style={styles.exampleLabel}>Exemplu</Text>
                <Text style={styles.exampleEnglish}>{item.example.english}</Text>
                <Text style={styles.exampleRomanian}>{item.example.romanian}</Text>
              </View>
            ) : null}
            <Text style={styles.selfCheck}>Ai știut răspunsul?</Text>
            <View style={styles.answerButtons}>
              <ReviewAnswerButton
                label="Da, am răspuns corect"
                correct
                onPress={() => onAnswer(true)}
              />
              <ReviewAnswerButton
                label="Nu, am greșit"
                correct={false}
                onPress={() => onAnswer(false)}
              />
            </View>
          </View>
        ) : (
          <View style={styles.revealButton}>
            <ActionButton title="Arată răspunsul" onPress={onReveal} />
          </View>
        )}
      </AppCard>
    </View>
  );
}

function ReviewAnswerButton({
  label,
  correct,
  onPress,
}: {
  label: string;
  correct: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.answerButton,
        correct ? styles.correctButton : styles.incorrectButton,
        pressed && styles.answerButtonPressed,
      ]}>
      <Text style={[styles.answerButtonText, !correct && styles.incorrectButtonText]}>{label}</Text>
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
    <AppCard
      eyebrow="Repetare finalizată"
      title="Foarte bine. Ai terminat sesiunea!"
      description={`Răspunsuri corecte: ${session.correctAnswers}. Răspunsuri greșite: ${session.incorrectAnswers}.`}>
      {dueCount > 0 ? (
        <ActionButton title="Mai repetă o dată" onPress={onRestart} />
      ) : (
        <Text style={styles.message}>Ai redus toate cuvintele la prioritatea zero.</Text>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 36,
  },
  dueBanner: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primarySoft,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  dueNumber: {
    color: colors.primary,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
  },
  dueLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '600',
  },
  message: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 28,
  },
  session: {
    gap: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  progressCount: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  progressTrack: {
    height: 9,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  prompt: {
    color: colors.text,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
    marginVertical: 12,
  },
  revealButton: {
    marginTop: 20,
  },
  answerArea: {
    gap: 20,
    marginTop: 12,
  },
  translationBlock: {
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  english: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
  },
  romanian: {
    color: colors.primary,
    fontSize: 23,
    lineHeight: 31,
    fontWeight: '600',
  },
  exampleBlock: {
    borderLeftColor: colors.primary,
    borderLeftWidth: 4,
    paddingLeft: 14,
    gap: 5,
  },
  exampleLabel: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  exampleEnglish: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  exampleRomanian: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 26,
  },
  selfCheck: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
  },
  answerButtons: {
    gap: 12,
  },
  answerButton: {
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  correctButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  incorrectButton: {
    backgroundColor: colors.surface,
    borderColor: colors.error,
  },
  answerButtonPressed: {
    opacity: 0.8,
  },
  answerButtonText: {
    color: colors.surface,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  incorrectButtonText: {
    color: colors.error,
  },
  error: {
    color: colors.error,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
  },
});
