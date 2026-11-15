import { createDialogueQuestion } from './create-dialogue.ts';
import { createHomeVocabularyLesson } from './create-home-vocabulary-lesson.ts';

const AUDIO_PREFIX = 'money';

const dialogues = [
  createDialogueQuestion(AUDIO_PREFIX, {
    id: 'total-thirteen-fifty',
    staffVoice: 'female',
    lines: [
      { speaker: 'staff', english: "That'll be thirteen fifty.", romanian: 'Face 13,50 de dolari.' },
      { speaker: 'customer', english: 'Okay, here you go.', romanian: 'Bine, poftiți.' },
    ],
    promptRomanian: 'Cât trebuie să plătești?',
    options: [
      { id: 'thirteen-fifty', text: '$13.50' },
      { id: 'thirty-fifty', text: '$30.50' },
      { id: 'three-fifteen', text: '$3.15' },
    ],
    correctOptionId: 'thirteen-fifty',
    focusItemIds: ['thirteen', 'price'],
    explanationRomanian:
      '„Thirteen fifty” = $13.50: întâi dolarii, apoi cenții. Ascultă finalul: thir-TEEN.',
  }),
  createDialogueQuestion(AUDIO_PREFIX, {
    id: 'apples-on-sale',
    staffVoice: 'male',
    lines: [
      {
        speaker: 'staff',
        english: 'The apples are on sale today. Just two ninety-nine a bag.',
        romanian: 'Merele sunt la reducere azi. Doar 2,99 de dolari punga.',
      },
    ],
    promptRomanian: 'Cât costă o pungă de mere?',
    options: [
      { id: 'nine-twenty-nine', text: '$9.29' },
      { id: 'two-ninety-nine', text: '$2.99' },
      { id: 'twenty-nine-ninety', text: '$29.90' },
    ],
    correctOptionId: 'two-ninety-nine',
    focusItemIds: ['on-sale', 'price'],
    explanationRomanian: '„Two ninety-nine” = $2.99. „On sale” înseamnă la reducere.',
  }),
  createDialogueQuestion(AUDIO_PREFIX, {
    id: 'thirty-plus-tax',
    staffVoice: 'female',
    lines: [
      { speaker: 'customer', english: 'Excuse me, how much is this?', romanian: 'Scuzați-mă, cât costă asta?' },
      {
        speaker: 'staff',
        english: "It's thirty dollars, plus tax.",
        romanian: 'Costă 30 de dolari, plus taxe.',
      },
    ],
    promptRomanian: 'Cât costă?',
    options: [
      { id: 'thirty-plus-tax', text: '$30 plus taxe' },
      { id: 'thirteen-plus-tax', text: '$13 plus taxe' },
      { id: 'thirty-with-tax', text: '$30 cu taxele incluse' },
    ],
    correctOptionId: 'thirty-plus-tax',
    focusItemIds: ['thirty', 'plus-tax', 'how-much'],
    explanationRomanian:
      '„THIR-ty” (30) are accentul la început. „Plus tax” înseamnă că la casă plătești puțin mai mult.',
  }),
];

const prices = createHomeVocabularyLesson({
  id: 'out-2-prices',
  title: {
    english: 'Prices and Money',
    romanian: 'Prețuri și bani',
  },
  descriptionRomanian: 'Cum se spun prețurile, ca să înțelegi cât ai de plătit.',
  estimatedMinutes: 18,
  audioKeyPrefix: AUDIO_PREFIX,
  phrases: true,
  groups: [
    {
      items: [
        {
          id: 'how-much',
          word: { english: 'How much is it?', romanian: 'Cât costă?' },
          example: {
            english: 'Excuse me, how much is this?',
            romanian: 'Scuzați-mă, cât costă asta?',
          },
        },
        {
          id: 'dollar',
          word: { english: 'dollar', romanian: 'dolar' },
          example: { english: "It's one dollar.", romanian: 'Costă un dolar.' },
          note: 'Moneda de 1 dolar se numește „loonie”, iar cea de 2 dolari „toonie”.',
        },
        {
          id: 'cents',
          word: { english: 'cents', romanian: 'cenți' },
          example: { english: "It's fifty cents.", romanian: 'Costă cincizeci de cenți.' },
          note: '100 de cenți fac 1 dolar. Moneda de 25 de cenți se numește „quarter”.',
        },
        {
          id: 'price',
          word: { english: 'two ninety-nine', romanian: '$2.99' },
          example: { english: 'The milk is four forty-nine.', romanian: 'Laptele costă $4.49.' },
          note: 'Prețurile se spun în două bucăți: întâi dolarii, apoi cenții. „Four forty-nine” = $4.49.',
        },
      ],
      recall: [
        {
          id: 'recall-how-much-ro',
          direction: 'english-to-romanian',
          answerItemId: 'how-much',
          optionItemIds: ['dollar', 'how-much', 'cents'],
        },
        {
          id: 'recall-cents-en',
          direction: 'romanian-to-english',
          answerItemId: 'cents',
          optionItemIds: ['dollar', 'price', 'cents'],
        },
      ],
    },
    {
      items: [
        {
          id: 'thirteen',
          word: { english: 'thirteen', romanian: 'treisprezece (13)' },
          example: { english: "It's thirteen dollars.", romanian: 'Costă treisprezece dolari.' },
          note: 'Atenție: thir-TEEN (13) are accentul la sfârșit și se termină cu „n”.',
        },
        {
          id: 'thirty',
          word: { english: 'thirty', romanian: 'treizeci (30)' },
          example: { english: "It's thirty dollars.", romanian: 'Costă treizeci de dolari.' },
          note: 'THIR-ty (30) are accentul la început. La fel: fifteen (15) și fifty (50).',
        },
        {
          id: 'plus-tax',
          word: { english: 'plus tax', romanian: 'plus taxe' },
          example: {
            english: "It's ten dollars plus tax.",
            romanian: 'Costă zece dolari plus taxe.',
          },
          note: 'În Canada, taxele nu sunt incluse în prețul de pe raft. La casă plătești puțin mai mult.',
        },
        {
          id: 'on-sale',
          word: { english: 'on sale', romanian: 'la reducere' },
          example: {
            english: 'The bread is on sale today.',
            romanian: 'Pâinea este la reducere azi.',
          },
        },
        {
          id: 'change',
          word: { english: "Here's your change.", romanian: 'Poftiți restul.' },
          example: {
            english: "Here's your change and your receipt.",
            romanian: 'Poftiți restul și bonul.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-thirteen-ro',
          direction: 'english-to-romanian',
          answerItemId: 'thirteen',
          optionItemIds: ['thirty', 'thirteen', 'price'],
        },
        {
          id: 'recall-on-sale-en',
          direction: 'romanian-to-english',
          answerItemId: 'on-sale',
          optionItemIds: ['plus-tax', 'on-sale', 'change'],
        },
      ],
    },
  ],
  practiceActivities: [
    {
      id: 'fill-money-tax',
      type: 'fill-in-the-blank',
      instructionRomanian: 'Alege cuvântul care completează propoziția.',
      sentence: "It's ten dollars plus ___.",
      completedSentence: "It's ten dollars plus tax.",
      translationRomanian: 'Costă zece dolari plus taxe.',
      options: [
        { id: 'tax', text: 'tax' },
        { id: 'change', text: 'change' },
        { id: 'sale', text: 'sale' },
      ],
      acceptedAnswers: ['tax'],
      focusItemIds: ['plus-tax'],
    },
    ...dialogues.map(({ activity }) => activity),
  ],
});

export const pricesLesson = prices.lesson;
export const pricesAudioSources = prices.audioSources;
export const pricesDialogues = dialogues.map(({ source }) => source);
