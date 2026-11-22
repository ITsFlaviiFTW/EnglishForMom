import { bathroomBasicsAudioSources } from '../lessons/bathroom-basics.ts';
import { bedroomBasicsAudioSources } from '../lessons/bedroom-basics.ts';
import { cleaningBasicsAudioSources } from '../lessons/cleaning-basics.ts';
import {
  conversationPartnerAudioSources,
  conversationResponseAudioSources,
} from '../lessons/conversations.ts';
import { essentialVerbsOneAudioSources } from '../lessons/essential-verbs-1.ts';
import { laundryBasicsAudioSources } from '../lessons/laundry-basics.ts';
import { livingRoomBasicsAudioSources } from '../lessons/living-room-basics.ts';
import { atTheStoreAudioSources, atTheStoreDialogues } from '../lessons/out-at-the-store.ts';
import { checkoutAudioSources, checkoutDialogues } from '../lessons/out-checkout.ts';
import { helpPhrasesAudioSources, helpPhrasesDialogues } from '../lessons/out-help-phrases.ts';
import { pricesAudioSources, pricesDialogues } from '../lessons/out-prices.ts';

export const kitchenBasicsAudio = {
  fridge: createPair('fridge', 'The milk is in the fridge.'),
  stove: createPair('stove', 'The stove is next to the fridge.'),
  oven: createPair('oven', 'The bread is in the oven.'),
  sink: createPair('sink', 'The sink is next to the stove.'),
  table: createPair('table', 'The table is in the kitchen.'),
  chair: createPair('chair', 'The chair is next to the table.'),
  plate: createPair('plate', 'Put the plate on the table.'),
  bowl: createPair('bowl', 'The bowl is on the table.'),
  cup: createPair('cup', 'The cup is next to the bowl.'),
  glass: createPair('glass', 'The glass is on the table.'),
  spoon: createPair('spoon', 'The spoon is in the bowl.'),
  fork: createPair('fork', 'The fork is next to the plate.'),
} as const;

export const generatedEnglishAudioSources = [
  ...Object.values(kitchenBasicsAudio).flatMap(({ word, example }) => [word, example]),
  ...bathroomBasicsAudioSources,
  ...bedroomBasicsAudioSources,
  ...livingRoomBasicsAudioSources,
  ...laundryBasicsAudioSources,
  ...cleaningBasicsAudioSources,
  ...essentialVerbsOneAudioSources,
  ...helpPhrasesAudioSources,
  ...pricesAudioSources,
  ...atTheStoreAudioSources,
  ...checkoutAudioSources,
  // Last, so phrases shared with the lessons keep their lessons' file names.
  ...conversationResponseAudioSources,
];

/**
 * Real-speed shop dialogues and what the other person says in the
 * conversations (several voices), recorded by `npm run generate-audio`.
 */
export const dialogueAudioSources = [
  ...helpPhrasesDialogues,
  ...pricesDialogues,
  ...atTheStoreDialogues,
  ...checkoutDialogues,
  ...conversationPartnerAudioSources,
];

function createPair(word: string, example: string) {
  const id = word.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');

  return {
    word: createSource(`kitchen-word-${id}`, word),
    example: createSource(`kitchen-example-${id}`, example),
  } as const;
}

function createSource(key: string, text: string) {
  return {
    key,
    text,
    locale: 'en-US',
    rate: 0.85,
  } as const;
}
