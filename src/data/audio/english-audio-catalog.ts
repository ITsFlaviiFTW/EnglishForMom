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

export const generatedEnglishAudioSources = Object.values(kitchenBasicsAudio).flatMap(
  ({ word, example }) => [word, example],
);

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
