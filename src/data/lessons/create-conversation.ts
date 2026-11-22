import type {
  AudioSource,
  ConversationPartner,
  ConversationTurnActivity,
  DialogueLine,
  LearningText,
  Lesson,
  LessonId,
} from '@/types';

import type { DialogueAudioSource, PartnerVoice } from './create-dialogue.ts';

export type ConversationDefinition = {
  id: LessonId;
  /** Short, used in audio keys: `talk-<slug>-…`. */
  slug: string;
  title: LearningText;
  descriptionRomanian: string;
  partner: ConversationPartner & { voice: PartnerVoice };
  /** The situation, shown on the first step ("Ești în magazin și cauți laptele."). */
  situationRomanian: string;
  turns: readonly {
    /** What the other person says first; leave out when she starts. */
    partner?: readonly LearningText[];
    /** In Romanian, what she should answer. */
    task: string;
    /** What she says. */
    say: LearningText;
  }[];
  /** What the other person says after her last answer. */
  closing?: readonly LearningText[];
};

/**
 * Turns a conversation script into a lesson: one step per thing she says.
 * Her lines are recorded like lesson phrases (normal, Romanian accent and word
 * by word); the other person's lines are recorded at real speed in their voice.
 */
export function createConversation(definition: ConversationDefinition) {
  const prefix = `talk-${definition.slug}`;
  const partner = { nameRomanian: definition.partner.nameRomanian, icon: definition.partner.icon };
  const responseSources: AudioSource[] = [];
  const partnerSources: DialogueAudioSource[] = [];

  const partnerRecording = (key: string, lines: readonly LearningText[]): AudioSource => {
    const source: DialogueAudioSource = {
      key,
      text: lines.map((line) => line.english).join(' '),
      locale: 'en-US',
      rate: 1,
      staffVoice: definition.partner.voice,
      lines: lines.map((line) => ({ ...line, speaker: 'staff' as const })),
    };
    partnerSources.push(source);
    return { key: source.key, text: source.text, locale: 'en-US', rate: 1 };
  };

  const history: DialogueLine[] = [];
  const activities = definition.turns.map((turn, index): ConversationTurnActivity => {
    const number = index + 1;
    const partnerLines = turn.partner ?? [];
    const responseAudio = {
      key: `${prefix}-say-${number}`,
      text: turn.say.english,
      locale: 'en-US',
      rate: 0.85,
    } as const;
    responseSources.push(responseAudio);
    const isLast = number === definition.turns.length;
    const closing = isLast ? (definition.closing ?? []) : [];

    const activity: ConversationTurnActivity = {
      id: `turn-${number}`,
      type: 'conversation-turn',
      ...(number === 1 ? { instructionRomanian: definition.situationRomanian } : {}),
      partner,
      history: [...history],
      partnerLines,
      ...(partnerLines.length > 0
        ? { partnerAudio: partnerRecording(`${prefix}-partner-${number}`, partnerLines) }
        : {}),
      taskRomanian: turn.task,
      response: turn.say,
      responseAudio,
      ...(closing.length > 0
        ? {
            closingLines: closing,
            closingAudio: partnerRecording(`${prefix}-partner-closing`, closing),
          }
        : {}),
    };

    history.push(...partnerLines.map((line) => ({ ...line, speaker: 'staff' as const })));
    history.push({ ...turn.say, speaker: 'customer' });
    return activity;
  });

  const lesson: Lesson = {
    id: definition.id,
    schemaVersion: 1,
    title: definition.title,
    descriptionRomanian: definition.descriptionRomanian,
    estimatedMinutes: Math.max(5, definition.turns.length * 2),
    activities,
  };

  return { lesson, responseSources, partnerSources };
}
