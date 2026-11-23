import { Link, useRouter } from 'expo-router';
import { useEffect, useEffectEvent, useState, useSyncExternalStore } from 'react';
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
import { AppCard } from '@/components/app-card';
import { Meaning } from '@/components/meaning';
import { ProgressBar } from '@/components/progress-bar';
import { ScreenContainer } from '@/components/screen-container';
import { colors, radii } from '@/constants/theme';
import { AudioControls, ReadAs } from '@/features/audio/listen-button';
import { useAudioPlayback } from '@/features/audio/use-audio-playback';
import { isRecordingSupported } from '@/features/speaking/recorder';
import {
  SpeakButtons,
  SpeakStatus,
  SpokenWords,
  useSpeakCheck,
  type SpeakCheck,
} from '@/features/speaking/speak-check';
import {
  getSpeakingTarget,
  isSpeakingStepDone,
  recordSpeakingAttempt,
  skipSpeaking,
  speakingCompletion,
  type SpeakingOutcome,
} from '@/features/speaking/speaking-gate';
import { ConversationTurn } from '@/features/lessons/conversation-turn';
import { isFillInAnswerCorrect } from '@/features/lessons/fill-in-the-blank';
import {
  getCorrectOption,
  isAnsweredActivity,
  type FillInTheBlankAnswerFeedback,
  type MultipleChoiceAnswerFeedback,
  type SentenceBuildingAnswerFeedback,
} from '@/features/lessons/lesson-session';
import { useLessonSession } from '@/hooks/use-lesson-session';
import type {
  AudioPlaybackState,
  AudioPlayOptions,
  AudioService,
} from '@/services/audio-service';
import type {
  ActivityResponse,
  AudioSource,
  ConversationTurnActivity,
  ExampleSentenceActivity,
  FillInTheBlankActivity,
  Lesson,
  LessonActivity,
  ListeningActivity,
  MultipleChoiceActivity,
  SentenceBuildingActivity,
  VocabularyIntroductionActivity,
} from '@/types';

type SupportedActivity =
  | VocabularyIntroductionActivity
  | ExampleSentenceActivity
  | MultipleChoiceActivity
  | ListeningActivity
  | SentenceBuildingActivity
  | FillInTheBlankActivity
  | ConversationTurnActivity;

export type NextLessonLink = {
  id: string;
  title: string;
  icon?: string;
};

type LessonPlayerProps = {
  lesson: Lesson;
  audioService: AudioService;
  initialActivityIndex?: number;
  saveError?: string | null;
  /** The lesson to suggest once this one is finished. */
  nextLesson?: NextLessonLink | null;
  onActivityCompleted?: (completion: {
    activity: SupportedActivity;
    response: ActivityResponse;
    correct: boolean | null;
  }) => void;
};

type AudioProps = {
  audioState: AudioPlaybackState;
  audioError: string | null;
  /** Resolves when the sound ends (or is stopped). */
  onPlayAudio: (source: AudioSource, options?: AudioPlayOptions) => Promise<void>;
  onStopAudio: () => void;
};

/** The "Acum spune tu" check on this step, or null when the step has none. */
type SpeakingProps = {
  speaking: SpeakCheck | null;
};

/** How long "✓ Foarte bine!" stays before the next card opens by itself. */
const AUTO_ADVANCE_MS = 1800;

export function LessonPlayer({
  lesson,
  audioService,
  initialActivityIndex = 0,
  saveError,
  nextLesson,
  onActivityCompleted,
}: LessonPlayerProps) {
  const lessonSession = useLessonSession(lesson, initialActivityIndex);
  const { session, currentActivity } = lessonSession;
  const audioPlayback = useAudioPlayback(audioService, currentActivity?.id);
  const [speaking, setSpeaking] = useState<Readonly<Record<string, SpeakingOutcome>>>({});
  // False while the page is pre-rendered; on the phone, whether it can record.
  const canRecord = useSyncExternalStore(subscribeToNothing, isRecordingSupported, () => false);

  if (session.status === 'completed') {
    return <LessonComplete lesson={lesson} nextLesson={nextLesson ?? null} />;
  }

  if (!currentActivity || !isSupportedActivity(currentActivity)) {
    return <UnsupportedActivity lesson={lesson} />;
  }

  return (
    <LessonStep
      // A new step starts fresh: scrolled to the top, its own microphone check.
      key={currentActivity.id}
      activity={currentActivity}
      audioPlayback={audioPlayback}
      canRecord={canRecord}
      lesson={lesson}
      lessonSession={lessonSession}
      onActivityCompleted={onActivityCompleted}
      saveError={saveError}
      speakingOutcome={speaking[currentActivity.id]}
      setSpeakingOutcome={(update) =>
        setSpeaking((current) => ({
          ...current,
          [currentActivity.id]: update(current[currentActivity.id]),
        }))
      }
    />
  );
}

function LessonStep({
  lesson,
  activity,
  lessonSession,
  audioPlayback,
  canRecord,
  speakingOutcome,
  setSpeakingOutcome,
  saveError,
  onActivityCompleted,
}: {
  lesson: Lesson;
  activity: SupportedActivity;
  lessonSession: ReturnType<typeof useLessonSession>;
  audioPlayback: ReturnType<typeof useAudioPlayback>;
  canRecord: boolean;
  speakingOutcome: SpeakingOutcome | undefined;
  setSpeakingOutcome: (
    update: (outcome: SpeakingOutcome | undefined) => SpeakingOutcome,
  ) => void;
  saveError?: string | null;
  onActivityCompleted: LessonPlayerProps['onActivityCompleted'];
}) {
  const {
    session,
    canContinue,
    answerMultipleChoice,
    toggleSentenceToken,
    checkSentenceAnswer,
    selectFillInAnswer,
    checkFillInAnswer,
    advance,
  } = lessonSession;
  const total = lesson.activities.length;
  const position = session.currentActivityIndex + 1;
  const isLastActivity = session.currentActivityIndex === total - 1;
  const response = session.responses[activity.id];
  // Words and sentences must be said right (or skipped after a few tries) before
  // moving on. Without a microphone the step works as before.
  const speakingTarget = canRecord ? getSpeakingTarget(activity) : null;
  const speakCheck = useSpeakCheck(
    speakingTarget
      ? {
          text: speakingTarget.text,
          outcome: speakingOutcome,
          onResult: (result) =>
            setSpeakingOutcome((outcome) => recordSpeakingAttempt(outcome, result)),
          onBeforeRecord: () => void audioPlayback.stop(),
        }
      : null,
  );

  const handleAdvance = () => {
    if (speakingTarget) {
      onActivityCompleted?.({ activity, ...speakingCompletion(speakingOutcome) });
      advance();
      return;
    }
    const completedResponse = response ?? { type: 'acknowledged' as const };
    const correct = isAnsweredActivity(activity) ? (session.feedback?.isCorrect ?? null) : null;
    onActivityCompleted?.({ activity, response: completedResponse, correct });
    advance();
  };
  const skipSpeakingStep = () => {
    onActivityCompleted?.({ activity, ...speakingCompletion(skipSpeaking(speakingOutcome)) });
    advance();
  };

  // Said right: a moment of praise, then the next card opens by itself. The
  // last turn of a conversation waits, so she hears the other person's goodbye.
  const autoAdvance =
    speakingOutcome?.status === 'passed' &&
    !(activity.type === 'conversation-turn' && activity.closingLines);
  const advanceByItself = useEffectEvent(handleAdvance);
  useEffect(() => {
    if (!autoAdvance) {
      return;
    }
    const timer = setTimeout(advanceByItself, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [autoAdvance]);

  const continueAction = {
    title: isLastActivity
      ? activity.type === 'conversation-turn'
        ? 'Termină conversația'
        : 'Termină lecția'
      : 'Continuă',
    onPress: handleAdvance,
    disabled: !canContinue,
  };

  let footerAction = continueAction;
  if (!session.feedback) {
    if (activity.type === 'multiple-choice' || activity.type === 'listening') {
      footerAction = { title: 'Alege un răspuns', onPress: () => {}, disabled: true };
    } else if (activity.type === 'sentence-building') {
      const selectedCount = response?.type === 'token-order' ? response.tokenIds.length : 0;
      footerAction = {
        title: 'Verifică',
        onPress: checkSentenceAnswer,
        disabled: selectedCount !== activity.correctTokenOrder.length,
      };
    } else if (activity.type === 'fill-in-the-blank') {
      footerAction = {
        title: 'Verifică',
        onPress: checkFillInAnswer,
        disabled: response?.type !== 'text',
      };
    }
  }

  const audioProps: AudioProps = {
    audioState: audioPlayback.state,
    audioError: audioPlayback.errorMessage,
    onPlayAudio: (source, options) => audioPlayback.play(source, options),
    onStopAudio: () => void audioPlayback.stop(),
  };

  return (
    <ScreenContainer
      header={
        <View style={styles.topBar}>
          <Link href="/lessons" asChild>
            <Pressable
              accessibilityLabel="Ieși din lecție. Progresul rămâne salvat."
              accessibilityRole="button"
              hitSlop={8}
              style={styles.exitPressable}>
              {({ pressed }) => (
                <View style={[styles.exitButton, pressed && styles.exitButtonPressed]}>
                  <Text style={styles.exitIcon}>✕</Text>
                  <Text style={styles.exitText}>Ieși</Text>
                </View>
              )}
            </Pressable>
          </Link>
          <ProgressBar
            accessibilityLabel={`Pasul ${position} din ${total}`}
            max={total}
            style={styles.topProgress}
            value={position}
          />
          <Text style={styles.stepCount}>
            {position}/{total}
          </Text>
        </View>
      }
      footer={
        <View style={styles.footerContent}>
          {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
          {speakingTarget ? <SpeakStatus check={speakCheck} /> : null}
          {speakingTarget && !isSpeakingStepDone(speakingOutcome) ? (
            <SpeakButtons check={speakCheck} onSkip={skipSpeakingStep} />
          ) : (
            <ActionButton
              disabled={footerAction.disabled}
              onPress={footerAction.onPress}
              title={footerAction.title}
            />
          )}
        </View>
      }>
      <Text style={styles.lessonTitle}>{lesson.title.romanian}</Text>
      <View style={styles.activityArea}>
        <ActivityRenderer
          activity={activity}
          feedback={session.feedback}
          response={response}
          onAnswer={answerMultipleChoice}
          onToggleSentenceToken={toggleSentenceToken}
          onSelectFillInAnswer={selectFillInAnswer}
          speaking={speakingTarget ? speakCheck : null}
          {...audioProps}
        />
      </View>
    </ScreenContainer>
  );
}

function subscribeToNothing() {
  return () => {};
}

type ActivityRendererProps = AudioProps & SpeakingProps & {
  activity: SupportedActivity;
  feedback: ReturnType<typeof useLessonSession>['session']['feedback'];
  response: ActivityResponse | undefined;
  onAnswer: (optionId: string) => void;
  onToggleSentenceToken: (tokenId: string) => void;
  onSelectFillInAnswer: (answer: string) => void;
};

function ActivityRenderer({
  activity,
  feedback,
  response,
  onAnswer,
  onToggleSentenceToken,
  onSelectFillInAnswer,
  speaking,
  ...audioProps
}: ActivityRendererProps) {
  switch (activity.type) {
    case 'vocabulary-introduction':
      return <VocabularyActivity activity={activity} speaking={speaking} {...audioProps} />;
    case 'example-sentence':
      return <ExampleActivity activity={activity} speaking={speaking} {...audioProps} />;
    case 'conversation-turn':
      return <ConversationTurn activity={activity} speaking={speaking} {...audioProps} />;
    case 'multiple-choice':
      return (
        <MultipleChoice
          activity={activity}
          feedback={feedback?.type === 'multiple-choice' ? feedback : null}
          onAnswer={onAnswer}
        />
      );
    case 'listening':
      return (
        <Listening
          activity={activity}
          feedback={feedback?.type === 'multiple-choice' ? feedback : null}
          onAnswer={onAnswer}
          {...audioProps}
        />
      );
    case 'sentence-building':
      return (
        <SentenceBuilding
          activity={activity}
          feedback={feedback?.type === 'sentence-building' ? feedback : null}
          selectedTokenIds={response?.type === 'token-order' ? response.tokenIds : []}
          onToggleToken={onToggleSentenceToken}
        />
      );
    case 'fill-in-the-blank':
      return (
        <FillInTheBlank
          activity={activity}
          feedback={feedback?.type === 'fill-in-the-blank' ? feedback : null}
          selectedAnswer={response?.type === 'text' ? response.value : null}
          onSelectAnswer={onSelectFillInAnswer}
          {...audioProps}
        />
      );
  }
}

function VocabularyActivity({
  activity,
  speaking,
  audioState,
  audioError,
  onPlayAudio,
  onStopAudio,
}: { activity: VocabularyIntroductionActivity } & AudioProps & SpeakingProps) {
  return (
    <AppCard>
      <Text style={activity.isPhrase ? styles.englishPhrase : styles.englishWord}>
        {activity.content.english}
      </Text>
      <ReadAs source={activity.audio} style={styles.readAs} />
      <Meaning style={styles.meaning} text={activity.content.romanian} />

      {activity.audio ? (
        <View style={styles.audioArea}>
          <AudioControls
            autoPlay
            errorMessage={audioError}
            label={activity.content.english}
            onPlay={onPlayAudio}
            onStop={onStopAudio}
            showReadAs={false}
            source={activity.audio}
            state={audioState}>
            {speaking ? <SpokenWords check={speaking} /> : null}
          </AudioControls>
        </View>
      ) : null}

      {activity.noteRomanian ? (
        <View style={styles.note}>
          <Text style={styles.noteText}>💡 {activity.noteRomanian}</Text>
        </View>
      ) : null}

      {activity.forms?.length ? (
        <View style={styles.formsSection}>
          <Text style={styles.sectionLabel}>Forme utile</Text>
          {activity.forms.map((form) => (
            <View key={`${form.english}-${form.romanian}`} style={styles.formRow}>
              <Text style={styles.formEnglish}>{form.english}</Text>
              <Text style={styles.formRomanian}>{form.romanian}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {activity.examples?.length ? (
        <View style={styles.formsSection}>
          <Text style={styles.sectionLabel}>Exemple</Text>
          {activity.examples.map((example) => (
            <View key={example.english} style={styles.exampleRow}>
              <Text style={styles.formEnglish}>{example.english}</Text>
              <Text style={styles.formRomanian}>{example.romanian}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </AppCard>
  );
}

function ExampleActivity({
  activity,
  speaking,
  audioState,
  audioError,
  onPlayAudio,
  onStopAudio,
}: { activity: ExampleSentenceActivity } & AudioProps & SpeakingProps) {
  return (
    <AppCard>
      <Text style={styles.englishSentence}>{activity.sentence.english}</Text>
      <ReadAs source={activity.sentence.audio} style={styles.readAs} />
      <Meaning style={styles.meaning} text={activity.sentence.romanian} />
      {activity.sentence.audio ? (
        <View style={styles.audioArea}>
          <AudioControls
            autoPlay
            errorMessage={audioError}
            label={activity.sentence.english}
            onPlay={onPlayAudio}
            onStop={onStopAudio}
            showReadAs={false}
            source={activity.sentence.audio}
            state={audioState}>
            {speaking ? <SpokenWords check={speaking} /> : null}
          </AudioControls>
        </View>
      ) : null}
    </AppCard>
  );
}

function MultipleChoice({
  activity,
  feedback,
  onAnswer,
}: {
  activity: MultipleChoiceActivity;
  feedback: MultipleChoiceAnswerFeedback | null;
  onAnswer: (optionId: string) => void;
}) {
  const correctOption = getCorrectOption(activity);

  return (
    <AppCard eyebrow="Întrebare">
      {activity.instructionRomanian ? (
        <Text style={styles.instruction}>{activity.instructionRomanian}</Text>
      ) : null}
      <Text style={styles.question}>{activity.prompt}</Text>

      <View style={styles.options}>
        {activity.options.map((option) => {
          const isSelected = feedback?.selectedOptionId === option.id;
          const isCorrectAnswer = Boolean(feedback && option.id === feedback.correctOptionId);

          return (
            <AnswerOption
              key={option.id}
              correct={isCorrectAnswer}
              disabled={Boolean(feedback)}
              incorrect={Boolean(isSelected && feedback && !feedback.isCorrect)}
              label={option.text}
              onPress={() => onAnswer(option.id)}
              selected={isSelected}
            />
          );
        })}
      </View>

      {feedback ? (
        <AnswerFeedback
          correct={feedback.isCorrect}
          message={
            feedback.isCorrect
              ? (activity.explanationRomanian ?? '')
              : `Răspunsul corect este „${correctOption?.text ?? ''}”. ${activity.explanationRomanian ?? ''}`
          }
        />
      ) : null}
    </AppCard>
  );
}

function Listening({
  activity,
  feedback,
  onAnswer,
  audioState,
  audioError,
  onPlayAudio,
  onStopAudio,
}: {
  activity: ListeningActivity;
  feedback: MultipleChoiceAnswerFeedback | null;
  onAnswer: (optionId: string) => void;
} & AudioProps) {
  const correctOption = getCorrectOption(activity);

  return (
    <AppCard eyebrow="Ascultă conversația">
      {activity.instructionRomanian ? (
        <Text style={styles.instruction}>{activity.instructionRomanian}</Text>
      ) : null}
      <View style={styles.audioArea}>
        <AudioControls
          errorMessage={audioError}
          label="conversația"
          onPlay={onPlayAudio}
          onStop={onStopAudio}
          source={activity.audio}
          state={audioState}
        />
      </View>
      <Text style={styles.listeningQuestion}>{activity.promptRomanian}</Text>

      <View style={styles.options}>
        {activity.options.map((option) => {
          const isSelected = feedback?.selectedOptionId === option.id;
          const isCorrectAnswer = Boolean(feedback && option.id === feedback.correctOptionId);

          return (
            <AnswerOption
              key={option.id}
              correct={isCorrectAnswer}
              disabled={Boolean(feedback)}
              incorrect={Boolean(isSelected && feedback && !feedback.isCorrect)}
              label={option.text}
              onPress={() => onAnswer(option.id)}
              selected={isSelected}
            />
          );
        })}
      </View>

      {feedback ? (
        <>
          <AnswerFeedback
            correct={feedback.isCorrect}
            message={
              feedback.isCorrect
                ? (activity.explanationRomanian ?? '')
                : `Răspunsul corect este „${correctOption?.text ?? ''}”. ${activity.explanationRomanian ?? ''}`
            }
          />
          <View style={styles.transcript}>
            <Text style={styles.sectionLabel}>Ce s-a spus</Text>
            {activity.transcript.map((line, index) => (
              <View key={`${index}-${line.english}`} style={styles.transcriptLine}>
                <Text style={styles.transcriptSpeaker}>
                  {line.speaker === 'staff' ? 'Magazinul' : 'Tu'}
                </Text>
                <Text style={styles.formEnglish}>{line.english}</Text>
                <Text style={styles.formRomanian}>{line.romanian}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </AppCard>
  );
}

function SentenceBuilding({
  activity,
  feedback,
  selectedTokenIds,
  onToggleToken,
}: {
  activity: SentenceBuildingActivity;
  feedback: SentenceBuildingAnswerFeedback | null;
  selectedTokenIds: readonly string[];
  onToggleToken: (tokenId: string) => void;
}) {
  const selectedTokens = selectedTokenIds.flatMap((tokenId) => {
    const token = activity.tokens.find((candidate) => candidate.id === tokenId);
    return token ? [token] : [];
  });
  const availableTokens = activity.tokens.filter((token) => !selectedTokenIds.includes(token.id));

  return (
    <AppCard eyebrow="Construiește propoziția">
      <Text style={styles.instruction}>{activity.promptRomanian}</Text>
      {activity.translationRomanian ? (
        <Text style={styles.sentenceTranslation}>{activity.translationRomanian}</Text>
      ) : null}

      <View accessibilityLabel="Propoziția ta" style={styles.answerArea}>
        {selectedTokens.length > 0 ? (
          <View style={styles.tokenRow}>
            {selectedTokens.map((token, index) => (
              <PressableShell
                key={token.id}
                accessibilityLabel={`Scoate „${token.text}”, poziția ${index + 1}`}
                disabled={Boolean(feedback)}
                onPress={() => onToggleToken(token.id)}
                style={[styles.wordToken, styles.selectedWordToken]}>
                <Text style={[styles.wordTokenText, styles.selectedWordTokenText]}>
                  {token.text}
                </Text>
              </PressableShell>
            ))}
          </View>
        ) : (
          <Text style={styles.answerPlaceholder}>Atinge cuvintele de mai jos, în ordine.</Text>
        )}
      </View>

      {!feedback && selectedTokens.length > 0 ? (
        <Text style={styles.hint}>Ai greșit ordinea? Atinge un cuvânt de sus ca să-l scoți.</Text>
      ) : null}

      <View style={[styles.tokenRow, styles.availableTokens]}>
        {availableTokens.map((token) => (
          <PressableShell
            key={token.id}
            accessibilityLabel={`Adaugă „${token.text}”`}
            disabled={Boolean(feedback)}
            onPress={() => onToggleToken(token.id)}
            style={styles.wordToken}>
            <Text style={styles.wordTokenText}>{token.text}</Text>
          </PressableShell>
        ))}
      </View>

      {feedback ? (
        <AnswerFeedback
          correct={feedback.isCorrect}
          message={
            feedback.isCorrect
              ? feedback.correctSentence
              : `Răspunsul corect: „${feedback.correctSentence}”`
          }
        />
      ) : null}
    </AppCard>
  );
}

function FillInTheBlank({
  activity,
  feedback,
  selectedAnswer,
  onSelectAnswer,
  audioState,
  audioError,
  onPlayAudio,
  onStopAudio,
}: {
  activity: FillInTheBlankActivity;
  feedback: FillInTheBlankAnswerFeedback | null;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
} & AudioProps) {
  return (
    <AppCard eyebrow="Completează">
      <Text style={styles.instruction}>
        {activity.instructionRomanian ?? 'Alege cuvântul care lipsește.'}
      </Text>
      <Text style={styles.fillSentence}>{activity.sentence.replace('___', '_____')}</Text>
      {activity.translationRomanian ? (
        <Text style={styles.romanianSentence}>{activity.translationRomanian}</Text>
      ) : null}

      <View style={styles.options}>
        {activity.options.map((option) => {
          const selected = selectedAnswer === option.text;
          const correct = Boolean(feedback && isFillInAnswerCorrect(activity, option.text));

          return (
            <AnswerOption
              key={option.id}
              correct={correct}
              disabled={Boolean(feedback)}
              incorrect={Boolean(selected && feedback && !feedback.isCorrect)}
              label={option.text}
              onPress={() => onSelectAnswer(option.text)}
              selected={selected}
            />
          );
        })}
      </View>

      {feedback ? (
        <>
          <AnswerFeedback
            correct={feedback.isCorrect}
            message={
              feedback.isCorrect
                ? feedback.correctSentence
                : `Răspunsul corect este „${feedback.correctAnswer}”: ${feedback.correctSentence}`
            }
          />
          {activity.audio ? (
            <View style={styles.audioArea}>
              <AudioControls
                errorMessage={audioError}
                label={feedback.correctSentence}
                onPlay={onPlayAudio}
                onStop={onStopAudio}
                size="compact"
                source={activity.audio}
                state={audioState}
              />
            </View>
          ) : null}
        </>
      ) : null}
    </AppCard>
  );
}

function AnswerFeedback({ correct, message }: { correct: boolean; message: string }) {
  const trimmed = message.trim();

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.feedback, correct ? styles.correctFeedback : styles.wrongFeedback]}>
      <Text style={[styles.feedbackTitle, correct ? styles.correctText : styles.wrongText]}>
        {correct ? '✓  Foarte bine!' : 'Aproape!'}
      </Text>
      {trimmed ? <Text style={styles.feedbackMessage}>{trimmed}</Text> : null}
    </View>
  );
}

function AnswerOption({
  label,
  disabled,
  selected,
  correct,
  incorrect,
  onPress,
}: {
  label: string;
  disabled: boolean;
  selected: boolean;
  correct: boolean;
  incorrect: boolean;
  onPress: () => void;
}) {
  return (
    <PressableShell
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.option,
        selected && styles.selectedOption,
        correct && styles.correctOption,
        incorrect && styles.wrongOption,
        disabled && !correct && !incorrect && styles.dimmedOption,
      ]}>
      <View
        style={[
          styles.optionMarker,
          selected && styles.selectedMarker,
          correct && styles.correctMarker,
          incorrect && styles.wrongMarker,
        ]}>
        {correct || incorrect || selected ? (
          <Text style={styles.optionMarkerText}>{correct ? '✓' : incorrect ? '✕' : '•'}</Text>
        ) : null}
      </View>
      <Text style={styles.optionText}>{label}</Text>
    </PressableShell>
  );
}

function LessonComplete({ lesson, nextLesson }: { lesson: Lesson; nextLesson: NextLessonLink | null }) {
  const router = useRouter();
  const newWords = lesson.activities.filter(
    (activity) => activity.type === 'vocabulary-introduction',
  ).length;
  const isConversation = lesson.activities.every((activity) => activity.type === 'conversation-turn');

  return (
    <ScreenContainer
      style={styles.completeScreen}
      footer={
        <View style={styles.completeActions}>
          {nextLesson ? (
            <ActionButton
              onPress={() =>
                router.replace({
                  pathname: '/lessons/[lessonId]',
                  params: { lessonId: nextLesson.id },
                })
              }
              title={`Lecția următoare ›`}
            />
          ) : null}
          <ActionButton
            onPress={() => router.replace('/')}
            title="Acasă"
            variant={nextLesson ? 'secondary' : 'primary'}
          />
        </View>
      }>
      <View style={styles.celebration}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text accessibilityRole="header" style={styles.completeTitle}>
          Felicitări!
        </Text>
        <Text style={styles.completeText}>
          Ai terminat {isConversation ? 'conversația' : 'lecția'} „{lesson.title.romanian}”.
        </Text>
      </View>

      <View style={styles.statRow}>
        {newWords > 0 ? (
          <View style={styles.statTile}>
            <Text style={styles.statNumber}>{newWords}</Text>
            <Text style={styles.statLabel}>{newWords === 1 ? 'cuvânt nou' : 'cuvinte noi'}</Text>
          </View>
        ) : null}
        <View style={styles.statTile}>
          <Text style={styles.statNumber}>{lesson.activities.length}</Text>
          <Text style={styles.statLabel}>{isConversation ? 'răspunsuri spuse' : 'pași parcurși'}</Text>
        </View>
      </View>

      <AppCard style={styles.tipCard}>
        <Text style={styles.tipText}>
          💡 Mâine, apasă din nou <Text style={styles.tipStrong}>Începe</Text>: întâi repeți ce
          ți-a fost greu, apoi vine lecția nouă.
        </Text>
        {nextLesson ? (
          <Text style={styles.nextLessonText}>
            Urmează: {nextLesson.icon ? `${nextLesson.icon} ` : ''}
            {nextLesson.title}
          </Text>
        ) : null}
      </AppCard>
    </ScreenContainer>
  );
}

function UnsupportedActivity({ lesson }: { lesson: Lesson }) {
  const router = useRouter();

  return (
    <ScreenContainer
      style={styles.completeScreen}
      footer={<ActionButton onPress={() => router.replace('/lessons')} title="Înapoi la lecții" />}>
      <AppCard
        title="Activitate indisponibilă"
        description={`Acest exercițiu din „${lesson.title.romanian}” va fi adăugat într-o versiune viitoare.`}
      />
    </ScreenContainer>
  );
}

function isSupportedActivity(activity: LessonActivity): activity is SupportedActivity {
  return (
    activity.type === 'vocabulary-introduction' ||
    activity.type === 'example-sentence' ||
    activity.type === 'multiple-choice' ||
    activity.type === 'listening' ||
    activity.type === 'sentence-building' ||
    activity.type === 'fill-in-the-blank' ||
    activity.type === 'conversation-turn'
  );
}

function PressableShell({
  accessibilityLabel,
  children,
  disabled,
  onPress,
  style,
}: Pick<PressableProps, 'accessibilityLabel' | 'children' | 'disabled' | 'onPress'> & {
  style: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [style, pressed && !disabled && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exitPressable: {
    borderRadius: radii.pill,
  },
  exitButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
  },
  exitButtonPressed: {
    backgroundColor: colors.primarySoft,
  },
  exitIcon: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  exitText: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  topProgress: {
    flex: 1,
  },
  stepCount: {
    minWidth: 48,
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  lessonTitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    marginTop: 6,
  },
  activityArea: {
    paddingTop: 14,
    paddingBottom: 8,
  },
  footerContent: {
    gap: 8,
  },
  instruction: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 26,
  },
  englishWord: {
    color: colors.text,
    fontSize: 46,
    lineHeight: 54,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 14,
  },
  englishPhrase: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    marginTop: 14,
  },
  readAs: {
    marginTop: 8,
  },
  meaning: {
    marginTop: 16,
  },
  note: {
    backgroundColor: colors.warmSoft,
    borderRadius: radii.medium,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
  },
  noteText: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 25,
  },
  listeningQuestion: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
    marginTop: 22,
  },
  transcript: {
    gap: 10,
    marginTop: 20,
  },
  transcriptLine: {
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 2,
  },
  transcriptSpeaker: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  audioArea: {
    marginTop: 22,
  },
  formsSection: {
    marginTop: 24,
    gap: 8,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  formRow: {
    backgroundColor: colors.background,
    borderRadius: radii.small,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  exampleRow: {
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  formEnglish: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
  },
  formRomanian: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 2,
  },
  englishSentence: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 39,
    fontWeight: '800',
    marginTop: 14,
  },
  romanianSentence: {
    color: colors.textMuted,
    fontSize: 20,
    lineHeight: 29,
    marginTop: 10,
  },
  question: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    marginTop: 10,
  },
  options: {
    gap: 12,
    marginTop: 22,
  },
  option: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: radii.medium,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pressed: {
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
  dimmedOption: {
    opacity: 0.6,
  },
  optionMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarker: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  correctMarker: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  wrongMarker: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  optionMarkerText: {
    color: colors.onPrimary,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  optionText: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '600',
  },
  sentenceTranslation: {
    color: colors.primary,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    marginTop: 10,
  },
  answerArea: {
    minHeight: 92,
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: radii.medium,
    padding: 12,
    marginTop: 18,
  },
  answerPlaceholder: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
  },
  tokenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  availableTokens: {
    marginTop: 18,
  },
  wordToken: {
    minHeight: 56,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 2,
    borderRadius: radii.small,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  selectedWordToken: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  wordTokenText: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedWordTokenText: {
    color: colors.onPrimary,
  },
  fillSentence: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '800',
    marginTop: 14,
  },
  feedback: {
    borderRadius: radii.medium,
    padding: 16,
    marginTop: 20,
    gap: 4,
  },
  correctFeedback: {
    backgroundColor: colors.successSoft,
  },
  wrongFeedback: {
    backgroundColor: colors.warmSoft,
  },
  feedbackTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '800',
  },
  correctText: {
    color: colors.success,
  },
  wrongText: {
    color: colors.warm,
  },
  feedbackMessage: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 26,
  },
  completeScreen: {
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 22,
  },
  completeActions: {
    gap: 12,
  },
  celebration: {
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkMark: {
    color: colors.success,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
  },
  completeTitle: {
    color: colors.text,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    textAlign: 'center',
  },
  completeText: {
    color: colors.textMuted,
    fontSize: 20,
    lineHeight: 29,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.large,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 18,
    alignItems: 'center',
  },
  statNumber: {
    color: colors.primary,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  tipCard: {
    gap: 10,
  },
  tipText: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 27,
  },
  tipStrong: {
    fontWeight: '800',
  },
  nextLessonText: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    marginTop: 10,
  },
  saveError: {
    color: colors.error,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
