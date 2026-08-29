import { createHomeVocabularyLesson } from './create-home-vocabulary-lesson.ts';

const cleaningBasics = createHomeVocabularyLesson({
  id: 'level-1-cleaning-basics',
  title: {
    english: 'Cleaning Basics',
    romanian: 'Curățenia: cuvinte de bază',
  },
  descriptionRomanian: 'Învață 14 cuvinte și expresii utile pentru curățenia casei.',
  estimatedMinutes: 18,
  prerequisiteLessonIds: ['level-1-laundry-basics'],
  audioKeyPrefix: 'cleaning',
  groups: [
    {
      items: [
        {
          id: 'vacuum-cleaner',
          word: { english: 'vacuum cleaner', romanian: 'aspirator' },
          example: {
            english: 'The vacuum cleaner is in the closet.',
            romanian: 'Aspiratorul este în dulap.',
          },
        },
        {
          id: 'broom',
          word: { english: 'broom', romanian: 'mătură' },
          example: { english: 'The broom is behind the door.', romanian: 'Mătura este în spatele ușii.' },
        },
        {
          id: 'mop',
          word: { english: 'mop', romanian: 'mop' },
          example: { english: 'Use the mop on the floor.', romanian: 'Folosește mopul pentru podea.' },
        },
      ],
      recall: [
        {
          id: 'recall-vacuum-cleaner-ro',
          direction: 'english-to-romanian',
          answerItemId: 'vacuum-cleaner',
          optionItemIds: ['mop', 'vacuum-cleaner', 'broom'],
        },
        {
          id: 'recall-broom-en',
          direction: 'romanian-to-english',
          answerItemId: 'broom',
          optionItemIds: ['vacuum-cleaner', 'mop', 'broom'],
        },
      ],
    },
    {
      items: [
        {
          id: 'bucket',
          word: { english: 'bucket', romanian: 'găleată' },
          example: { english: 'The water is in the bucket.', romanian: 'Apa este în găleată.' },
        },
        {
          id: 'sponge',
          word: { english: 'sponge', romanian: 'burete' },
          example: {
            english: 'Clean the sink with the sponge.',
            romanian: 'Curăță chiuveta cu buretele.',
          },
        },
        {
          id: 'cloth',
          word: { english: 'cloth', romanian: 'lavetă' },
          example: { english: 'Wipe the table with the cloth.', romanian: 'Șterge masa cu laveta.' },
        },
      ],
      recall: [
        {
          id: 'recall-sponge-ro',
          direction: 'english-to-romanian',
          answerItemId: 'sponge',
          optionItemIds: ['bucket', 'cloth', 'sponge'],
        },
        {
          id: 'recall-cloth-en',
          direction: 'romanian-to-english',
          answerItemId: 'cloth',
          optionItemIds: ['sponge', 'cloth', 'bucket'],
        },
      ],
    },
    {
      items: [
        {
          id: 'cleaning-spray',
          word: { english: 'cleaning spray', romanian: 'spray de curățat' },
          example: {
            english: 'Use the cleaning spray on the mirror.',
            romanian: 'Folosește spray-ul de curățat pe oglindă.',
          },
        },
        {
          id: 'gloves',
          word: { english: 'gloves', romanian: 'mănuși' },
          example: { english: 'Put on the gloves.', romanian: 'Pune-ți mănușile.' },
        },
        {
          id: 'trash-can',
          word: { english: 'trash can', romanian: 'coș de gunoi' },
          example: {
            english: 'The trash can is under the sink.',
            romanian: 'Coșul de gunoi este sub chiuvetă.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-cleaning-spray-ro',
          direction: 'english-to-romanian',
          answerItemId: 'cleaning-spray',
          optionItemIds: ['gloves', 'trash-can', 'cleaning-spray'],
        },
        {
          id: 'recall-gloves-en',
          direction: 'romanian-to-english',
          answerItemId: 'gloves',
          optionItemIds: ['cleaning-spray', 'gloves', 'trash-can'],
        },
      ],
    },
    {
      items: [
        {
          id: 'trash-bag',
          word: { english: 'trash bag', romanian: 'sac de gunoi' },
          example: {
            english: 'Put the trash bag in the trash can.',
            romanian: 'Pune sacul de gunoi în coșul de gunoi.',
          },
        },
        {
          id: 'dust',
          word: { english: 'dust', romanian: 'praf' },
          example: { english: 'There is dust on the shelf.', romanian: 'Este praf pe raft.' },
        },
        {
          id: 'floor',
          word: { english: 'floor', romanian: 'podea' },
          example: { english: 'The floor is clean.', romanian: 'Podeaua este curată.' },
        },
      ],
      recall: [
        {
          id: 'recall-trash-bag-ro',
          direction: 'english-to-romanian',
          answerItemId: 'trash-bag',
          optionItemIds: ['floor', 'trash-bag', 'dust'],
        },
        {
          id: 'recall-floor-en',
          direction: 'romanian-to-english',
          answerItemId: 'floor',
          optionItemIds: ['trash-bag', 'dust', 'floor'],
        },
      ],
    },
    {
      items: [
        {
          id: 'clean',
          word: { english: 'clean', romanian: 'a curăța' },
          example: {
            english: 'I clean the bathroom every day.',
            romanian: 'Curăț baia în fiecare zi.',
          },
        },
        {
          id: 'dirty',
          word: { english: 'dirty', romanian: 'murdar' },
          example: {
            english: 'The kitchen floor is dirty.',
            romanian: 'Podeaua din bucătărie este murdară.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-clean-ro',
          direction: 'english-to-romanian',
          answerItemId: 'clean',
          optionItemIds: ['dirty', 'clean', 'floor'],
        },
        {
          id: 'recall-dirty-en',
          direction: 'romanian-to-english',
          answerItemId: 'dirty',
          optionItemIds: ['clean', 'floor', 'dirty'],
        },
      ],
    },
  ],
});

export const cleaningBasicsLesson = cleaningBasics.lesson;
export const cleaningBasicsAudioSources = cleaningBasics.audioSources;
