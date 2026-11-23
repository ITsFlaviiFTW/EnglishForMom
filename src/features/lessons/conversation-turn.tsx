import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { Meaning } from '@/components/meaning';
import { colors, radii } from '@/constants/theme';
import { AudioControls, ReadAs } from '@/features/audio/listen-button';
import { SpokenWords, type SpeakCheck } from '@/features/speaking/speak-check';
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
  /** The microphone check (its button is at the bottom), or null on a phone that cannot record. */
  speaking: SpeakCheck | null;
  audioState: AudioPlaybackState;
  audioError: string | null;
  onPlayAudio: (source: AudioSource, options?: AudioPlayOptions) => Promise<void>;
  onStopAudio: () => void;
};

/**
 * One exchange of a talk-back conversation: what was said so far, what the
 * other person says now (real speed, playing by itself), and her turn. Her
 * answer is always shown, with its "Se citește" spelling, and plays by itself
 * right after the other person, so she only has to repeat it: listen, then
 * the microphone button at the bottom.
 */
export function ConversationTurn({
  activity,
  speaking,
  audioState,
  audioError,
  onPlayAudio,
  onStopAudio,
}: ConversationTurnProps) {
  const partnerSpeaks = activity.partnerLines.length > 0 && Boolean(activity.partnerAudio);
  const [activeAudio, setActiveAudio] = useState<AudioGroup | null>(null);
  // Her answer plays once the other person has finished; at once when she speaks first.
  const [partnerHeard, setPartnerHeard] = useState(!partnerSpeaks);
  const plays = useRef(0);
  const finished = !speaking || isSpeakingStepDone(speaking.outcome);

  const audioFor = (group: AudioGroup) => ({
    state: activeAudio === group ? audioState : ('idle' as const),
    errorMessage: activeAudio === group ? audioError : null,
    onPlay: (source: AudioSource, options?: AudioPlayOptions) => {
      const play = ++plays.current;
      setActiveAudio(group);
      void onPlayAudio(source, options).then(() => {
        // Only when nothing else started meanwhile: a tap on another button wins.
        if (group === 'partner' && plays.current === play) {
          setPartnerHeard(true);
        }
      });
    },
    // Stopping the other person does not start her answer by itself.
    onStop: () => {
      plays.current += 1;
      onStopAudio();
    },
  });

  return (
    <AppCard>
      {activity.instructionRomanian ? (
        <Text style={styles.instruction}>{activity.instructionRomanian}</Text>
      ) : null}

      {activity.history.length > 0 ? (
        <History lines={activity.history} partner={activity.partner} />
      ) : null}

      {activity.partnerLines.length > 0 && activity.partnerAudio ? (
        <PartnerSays
          audio={activity.partnerAudio}
          autoPlay
          lines={activity.partnerLines}
          partner={activity.partner}
          {...audioFor('partner')}
        />
      ) : null}

      <View style={styles.yourTurn}>
        <Text style={styles.yourTurnLabel}>🗣️ Rândul tău</Text>
        <Text style={styles.task}>{activity.taskRomanian}</Text>

        <View style={styles.answer}>
          <Text style={styles.answerEnglish}>{activity.response.english}</Text>
          <ReadAs source={activity.responseAudio} />
          <Meaning size="compact" text={activity.response.romanian} />
          <AudioControls
            autoPlay={partnerHeard}
            label={activity.response.english}
            showReadAs={false}
            size="compact"
            source={activity.responseAudio}
            {...audioFor('response')}>
            {speaking ? <SpokenWords check={speaking} /> : null}
          </AudioControls>
        </View>
      </View>

      {finished && activity.closingLines && activity.closingAudio ? (
        <PartnerSays
          audio={activity.closingAudio}
          autoPlay
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
  autoPlay = false,
  state,
  errorMessage,
  onPlay,
  onStop,
}: {
  partner: ConversationPartner;
  lines: readonly LearningText[];
  audio: AudioSource;
  autoPlay?: boolean;
  state: AudioPlaybackState;
  errorMessage: string | null;
  onPlay: (source: AudioSource, options?: AudioPlayOptions) => void;
  onStop: () => void;
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
        autoPlay={autoPlay}
        errorMessage={errorMessage}
        label={`ce spune ${partner.nameRomanian}`}
        onPlay={onPlay}
        onStop={onStop}
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
});
