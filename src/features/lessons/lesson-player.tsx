import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ActionButton } from '@/components/action-button';
import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/theme';
import { getCorrectOption } from '@/features/lessons/lesson-session';
import { useLessonSession } from '@/hooks/use-lesson-session';
import type {
  ExampleSentenceActivity,
  Lesson,
  LessonActivity,
  MultipleChoiceActivity,
  VocabularyIntroductionActivity,
} from '@/types';

type SupportedActivity =
  | VocabularyIntroductionActivity
  | ExampleSentenceActivity
  | MultipleChoiceActivity;

type LessonPlayerProps = {
  lesson: Lesson;
};

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const { session, currentActivity, canContinue, answerMultipleChoice, advance } =
    useLessonSession(lesson);

  if (session.status === 'completed') {
    return <LessonComplete lesson={lesson} />;
  }

  if (!currentActivity || !isSupportedActivity(currentActivity)) {
    return <UnsupportedActivity lesson={lesson} />;
  }

  const progress = ((session.currentActivityIndex + 1) / lesson.activities.length) * 100;

  return (
    <ScreenContainer style={styles.screen}>
      <ScreenHeader
        backHref="/lessons"
        backLabel="← Lecții"
        title={lesson.title.romanian}
        description={lesson.title.english}
      />

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Pasul curent</Text>
        <Text style={styles.progressCount}>
          {session.currentActivityIndex + 1} / {lesson.activities.length}
        </Text>
      </View>
      <View
        accessibilityLabel={`Progresul lecției: ${session.currentActivityIndex + 1} din ${lesson.activities.length}`}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 1,
          max: lesson.activities.length,
          now: session.currentActivityIndex + 1,
        }}
        style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.activityArea}>
        <ActivityRenderer
          activity={currentActivity}
          feedback={session.feedback}
          onAnswer={answerMultipleChoice}
        />
      </View>

      {currentActivity.type !== 'multiple-choice' || session.feedback ? (
        <ActionButton
          title={
            session.currentActivityIndex === lesson.activities.length - 1
              ? 'Finish · Termină lecția'
              : 'Next · Continuă'
          }
          onPress={advance}
          disabled={!canContinue}
        />
      ) : null}
    </ScreenContainer>
  );
}

type ActivityRendererProps = {
  activity: SupportedActivity;
  feedback: ReturnType<typeof useLessonSession>['session']['feedback'];
  onAnswer: (optionId: string) => void;
};

function ActivityRenderer({ activity, feedback, onAnswer }: ActivityRendererProps) {
  switch (activity.type) {
    case 'vocabulary-introduction':
      return <VocabularyActivity activity={activity} />;
    case 'example-sentence':
      return <ExampleActivity activity={activity} />;
    case 'multiple-choice':
      return <MultipleChoice activity={activity} feedback={feedback} onAnswer={onAnswer} />;
  }
}

function VocabularyActivity({ activity }: { activity: VocabularyIntroductionActivity }) {
  return (
    <AppCard eyebrow="Cuvânt nou" title={activity.instructionRomanian ?? 'Citește cuvântul.'}>
      <Text style={styles.englishWord}>{activity.content.english}</Text>
      <Text style={styles.romanianMeaning}>{activity.content.romanian}</Text>
    </AppCard>
  );
}

function ExampleActivity({ activity }: { activity: ExampleSentenceActivity }) {
  return (
    <AppCard
      eyebrow="Exemplu"
      title={activity.instructionRomanian ?? 'Citește propoziția.'}>
      <Text style={styles.englishSentence}>{activity.sentence.english}</Text>
      <Text style={styles.romanianSentence}>{activity.sentence.romanian}</Text>
    </AppCard>
  );
}

type MultipleChoiceProps = {
  activity: MultipleChoiceActivity;
  feedback: ReturnType<typeof useLessonSession>['session']['feedback'];
  onAnswer: (optionId: string) => void;
};

function MultipleChoice({ activity, feedback, onAnswer }: MultipleChoiceProps) {
  const correctOption = getCorrectOption(activity);

  return (
    <View style={styles.questionContainer}>
      <Text style={styles.instruction}>{activity.instructionRomanian}</Text>
      <Text style={styles.question}>{activity.prompt}</Text>

      <View style={styles.options}>
        {activity.options.map((option) => {
          const isSelected = feedback?.selectedOptionId === option.id;
          const isCorrectAnswer = feedback && option.id === feedback.correctOptionId;

          return (
            <ActionOption
              key={option.id}
              label={option.text}
              disabled={Boolean(feedback)}
              selected={isSelected}
              correct={Boolean(isCorrectAnswer)}
              incorrect={Boolean(isSelected && feedback && !feedback.isCorrect)}
              onPress={() => onAnswer(option.id)}
            />
          );
        })}
      </View>

      {feedback ? (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.feedback, feedback.isCorrect ? styles.correctFeedback : styles.wrongFeedback]}>
          <Text style={[styles.feedbackTitle, feedback.isCorrect ? styles.correctText : styles.wrongText]}>
            {feedback.isCorrect ? 'Corect!' : 'Nu este corect.'}
          </Text>
          <Text style={styles.feedbackMessage}>
            {feedback.isCorrect
              ? activity.explanationRomanian
              : `Răspunsul corect este „${correctOption?.text ?? ''}”. ${activity.explanationRomanian ?? ''}`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

type ActionOptionProps = {
  label: string;
  disabled: boolean;
  selected: boolean;
  correct: boolean;
  incorrect: boolean;
  onPress: () => void;
};

function ActionOption({
  label,
  disabled,
  selected,
  correct,
  incorrect,
  onPress,
}: ActionOptionProps) {
  return (
    <ActionButtonShell
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.option,
        selected && styles.selectedOption,
        correct && styles.correctOption,
        incorrect && styles.wrongOption,
      ]}>
      <Text style={styles.optionText}>{label}</Text>
    </ActionButtonShell>
  );
}

function LessonComplete({ lesson }: { lesson: Lesson }) {
  return (
    <ScreenContainer style={styles.completeScreen}>
      <AppCard
        eyebrow="Lecție finalizată"
        title="Foarte bine. Ai terminat lecția!"
        description={`Ai parcurs toate cele ${lesson.activities.length} activități.`}
      />
      <View style={styles.completeActions}>
        <AppButton href="/lessons" title="Înapoi la lecții" variant="primary" />
        <AppButton href="/" title="Acasă" />
      </View>
    </ScreenContainer>
  );
}

function UnsupportedActivity({ lesson }: { lesson: Lesson }) {
  return (
    <ScreenContainer style={styles.completeScreen}>
      <AppCard
        title="Activitate indisponibilă"
        description="Acest tip de activitate va fi adăugat într-o versiune viitoare."
      />
      <AppButton href="/lessons" title={`Ieși din „${lesson.title.romanian}”`} />
    </ScreenContainer>
  );
}

function isSupportedActivity(activity: LessonActivity): activity is SupportedActivity {
  return (
    activity.type === 'vocabulary-introduction' ||
    activity.type === 'example-sentence' ||
    activity.type === 'multiple-choice'
  );
}

type ActionButtonShellProps = Pick<PressableProps, 'children' | 'disabled' | 'onPress'> & {
  style: StyleProp<ViewStyle>;
};

function ActionButtonShell({ children, disabled, onPress, style }: ActionButtonShellProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [style, pressed && !disabled && styles.optionPressed]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 36,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  progressCount: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  activityArea: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 28,
  },
  englishWord: {
    color: colors.text,
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '700',
  },
  romanianMeaning: {
    color: colors.primary,
    fontSize: 24,
    lineHeight: 32,
    marginTop: 8,
  },
  englishSentence: {
    color: colors.text,
    fontSize: 27,
    lineHeight: 37,
    fontWeight: '700',
  },
  romanianSentence: {
    color: colors.textMuted,
    fontSize: 19,
    lineHeight: 29,
    marginTop: 12,
  },
  questionContainer: {
    gap: 16,
  },
  instruction: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 25,
  },
  question: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 37,
    fontWeight: '700',
  },
  options: {
    gap: 12,
  },
  option: {
    minHeight: 60,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  optionPressed: {
    backgroundColor: colors.primarySoft,
  },
  selectedOption: {
    borderColor: colors.primary,
  },
  correctOption: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  wrongOption: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.error,
  },
  optionText: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '600',
  },
  feedback: {
    borderRadius: 14,
    padding: 16,
  },
  correctFeedback: {
    backgroundColor: colors.successSoft,
  },
  wrongFeedback: {
    backgroundColor: colors.errorSoft,
  },
  feedbackTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
  },
  correctText: {
    color: colors.success,
  },
  wrongText: {
    color: colors.error,
  },
  feedbackMessage: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 4,
  },
  completeScreen: {
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 24,
  },
  completeActions: {
    gap: 12,
  },
});
