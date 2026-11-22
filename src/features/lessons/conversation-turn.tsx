import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { colors, radii } from '@/constants/theme';
import { AudioControls, ReadAs } from '@/features/audio/listen-button';
import { SpeakCheck } from '@/features/speaking/speak-check';
import { isSpeakingStepDone } from '@/features/speaking/speaking-gate';
import type { AudioPlaybackState, AudioPlayOptions } from '@/services/audio-service';
import type {
  AudioSource,
  ConversationPartner,
  ConversationTurnActivity,
  DialogueLine,
  LearningText,
} from '@/types';

type AudioGroup = 'partner' | 'response' | 'closing';

type ConversationTurnProps = {
  activity: ConversationTurnActivity;
  /** The microphone check, or null on a phone that cannot record. */
  speaking: ComponentProps<typeof SpeakCheck> | null;
  audioState: AudioPlaybackState;
  audioError: string | null;
  onPlayAudio: (source: AudioSource, options?: AudioPlayOptions) => void;
};

/**
 * One exchange of a talk-back conversation: what was said so far, what the
 * other person says now (real speed), and her turn. She can try to answer from
 * memory; "Arată ce să spui" (or a first miss) shows the English, the
 * "Se citește" spelling and the recordings.
 */
export function ConversationTurn({
  activity,
  speaking,
  audioState,
  audioError,
  onPlayAudio,
}: ConversationTurnProps) {
  const [revealed, setRevealed] = useState(false);
  const [activeAudio, setActiveAudio] = useState<AudioGroup | null>(null);
  const outcome = speaking?.outcome;
  const attempts = outcome?.attempts ?? 0;
  const missedOnce = attempts > (outcome?.status === 'passed' ? 1 : 0);
  const showAnswer = revealed || missedOnce;
  const fromMemory = outcome?.status === 'passed' && attempts === 1 && !revealed;
  const finished = !speaking || isSpeakingStepDone(outcome);

  const audioFor = (group: AudioGroup) => ({
    state: activeAudio === group ? audioState : ('idle' as const),
    errorMessage: activeAudio === group ? audioError : null,
    onPlay: (source: AudioSource, options?: AudioPlayOptions) => {
      setActiveAudio(group);
      onPlayAudio(source, options);
    },
  });

  return (
    <AppCard eyebrow="Conversație">
      {activity.instructionRomanian ? (
        <Text style={styles.instruction}>{activity.instructionRomanian}</Text>
      ) : null}

      {activity.history.length > 0 ? (
        <History lines={activity.history} partner={activity.partner} />
      ) : null}

      {activity.partnerLines.length > 0 && activity.partnerAudio ? (
        <PartnerSays
          audio={activity.partnerAudio}
          lines={activity.partnerLines}
          partner={activity.partner}
          {...audioFor('partner')}
        />
      ) : null}

      <View style={styles.yourTurn}>
        <Text style={styles.yourTurnLabel}>🗣️ Rândul tău</Text>
        <Text style={styles.task}>{activity.taskRomanian}</Text>

        {showAnswer ? (
          <View style={styles.answer}>
            <Text style={styles.answerEnglish}>{activity.response.english}</Text>
            <ReadAs source={activity.responseAudio} />
            <Text style={styles.answerRomanian}>{activity.response.romanian}</Text>
            <AudioControls
              label={activity.response.english}
              showReadAs={false}
              size="compact"
              source={activity.responseAudio}
              {...audioFor('response')}
            />
          </View>
        ) : (
          <View style={styles.revealArea}>
            <Text style={styles.revealHint}>
              Încearcă întâi din memorie. Dacă nu știi ce să spui, apasă aici:
            </Text>
            <Pressable accessibilityRole="button" onPress={() => setRevealed(true)}>
              {({ pressed }) => (
                <View style={[styles.revealButton, pressed && styles.revealButtonPressed]}>
                  <Text style={styles.revealButtonText}>👀 Arată ce să spui</Text>
                </View>
              )}
            </Pressable>
          </View>
        )}
      </View>

      {speaking ? (
        <View style={styles.speakArea}>
          <SpeakCheck {...speaking} />
        </View>
      ) : null}

      {fromMemory ? (
        <Text accessibilityLiveRegion="polite" style={styles.praise}>
          ⭐ Ai răspuns din memorie! Excelent!
        </Text>
      ) : null}

      {finished && activity.closingLines && activity.closingAudio ? (
        <PartnerSays
          audio={activity.closingAudio}
          lines={activity.closingLines}
          partner={activity.partner}
          {...audioFor('closing')}
        />
      ) : null}
    </AppCard>
  );
}

function PartnerSays({
  partner,
  lines,
  audio,
  state,
  errorMessage,
  onPlay,
}: {
  partner: ConversationPartner;
  lines: readonly LearningText[];
  audio: AudioSource;
  state: AudioPlaybackState;
  errorMessage: string | null;
  onPlay: (source: AudioSource, options?: AudioPlayOptions) => void;
}) {
  return (
    <View style={styles.partnerBubble}>
      <Text style={styles.partnerName}>
        {partner.icon} {partner.nameRomanian} spune:
      </Text>
      {lines.map((line) => (
        <View key={line.english} style={styles.partnerLine}>
          <Text style={styles.partnerEnglish}>{line.english}</Text>
          <Text style={styles.partnerRomanian}>{line.romanian}</Text>
        </View>
      ))}
      <AudioControls
        errorMessage={errorMessage}
        label={`ce spune ${partner.nameRomanian}`}
        onPlay={onPlay}
        size="compact"
        source={audio}
        state={state}
      />
    </View>
  );
}

/** What was said so far, small: the other person on the left, her on the right. */
function History({ lines, partner }: { lines: readonly DialogueLine[]; partner: ConversationPartner }) {
  return (
    <View style={styles.history}>
      {lines.map((line, index) => {
        const mine = line.speaker === 'customer';
        return (
          <View
            key={`${index}-${line.english}`}
            style={[styles.historyLine, mine ? styles.historyMine : styles.historyTheirs]}>
            <Text style={styles.historyWho}>{mine ? 'Tu' : `${partner.icon} ${partner.nameRomanian}`}</Text>
            <Text style={styles.historyText}>{line.english}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  instruction: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 16,
  },
  history: {
    gap: 6,
    marginBottom: 14,
  },
  historyLine: {
    maxWidth: '88%',
    borderRadius: radii.medium,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  historyTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
  },
  historyMine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primarySoft,
  },
  historyWho: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  historyText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
  },
  partnerBubble: {
    gap: 10,
    borderRadius: radii.medium,
    backgroundColor: colors.surfaceMuted,
    padding: 14,
    marginBottom: 14,
  },
  partnerName: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  partnerLine: {
    gap: 4,
  },
  partnerEnglish: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '800',
  },
  partnerRomanian: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 24,
  },
  yourTurn: {
    gap: 8,
    borderRadius: radii.medium,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 14,
  },
  yourTurnLabel: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  task: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  answer: {
    gap: 10,
    marginTop: 4,
  },
  answerEnglish: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '800',
  },
  answerRomanian: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 24,
  },
  revealArea: {
    gap: 8,
    marginTop: 2,
  },
  revealHint: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  revealButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.medium,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 14,
  },
  revealButtonPressed: {
    backgroundColor: colors.border,
  },
  revealButtonText: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  speakArea: {
    marginTop: 14,
  },
  praise: {
    marginTop: 10,
    color: colors.warm,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '800',
    textAlign: 'center',
  },
});
