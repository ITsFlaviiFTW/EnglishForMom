import type { ChoiceOption, DialogueLine, ListeningActivity } from '@/types';

/**
 * A recorded real-life dialogue, made by `npm run generate-audio`: staff lines
 * are read by a Canadian voice (female or male), customer lines by the usual
 * English voice, all at normal speaking speed.
 */
export type DialogueAudioSource = {
  key: string;
  /** Read by the phone's own voice if the recording is missing. */
  text: string;
  locale: 'en-US';
  rate: number;
  staffVoice: 'female' | 'male';
  lines: readonly DialogueLine[];
};

type DialogueQuestion = {
  id: string;
  staffVoice: 'female' | 'male';
  lines: readonly DialogueLine[];
  promptRomanian: string;
  options: readonly ChoiceOption[];
  correctOptionId: string;
  /** Phrases from the lesson that this dialogue practises (missed ones go to review). */
  focusItemIds?: readonly string[];
  explanationRomanian?: string;
};

export function createDialogueQuestion(audioKeyPrefix: string, question: DialogueQuestion) {
  const source: DialogueAudioSource = {
    key: `${audioKeyPrefix}-dialogue-${question.id}`,
    text: question.lines.map((line) => line.english).join(' '),
    locale: 'en-US',
    rate: 1,
    staffVoice: question.staffVoice,
    lines: question.lines,
  };

  const activity: ListeningActivity = {
    id: `listen-${question.id}`,
    type: 'listening',
    instructionRomanian:
      'Ascultă conversația. Se vorbește normal, ca în magazin. Dacă e prea repede, apasă „Mai rar”.',
    audio: { key: source.key, text: source.text, locale: 'en-US', rate: 1 },
    promptRomanian: question.promptRomanian,
    options: question.options,
    correctOptionId: question.correctOptionId,
    transcript: question.lines,
    ...(question.focusItemIds ? { focusItemIds: question.focusItemIds } : {}),
    ...(question.explanationRomanian ? { explanationRomanian: question.explanationRomanian } : {}),
  };

  return { activity, source };
}
