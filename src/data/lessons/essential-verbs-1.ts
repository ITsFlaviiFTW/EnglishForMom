import type {
  AudioSource,
  ExampleSentenceActivity,
  LearningText,
  Lesson,
  MultipleChoiceActivity,
  VocabularyIntroductionActivity,
} from '@/types';

type VerbItem = {
  id: string;
  infinitive: LearningText;
  forms: readonly LearningText[];
  examples: readonly LearningText[];
};

type VerbGroup = {
  verbs: readonly VerbItem[];
  recall: readonly MultipleChoiceActivity[];
};

const verbGroups = [
  {
    verbs: [
      {
        id: 'be',
        infinitive: { english: 'to be', romanian: 'a fi' },
        forms: [
          { english: 'I am', romanian: 'eu sunt' },
          { english: 'you are', romanian: 'tu ești / dumneavoastră sunteți' },
          { english: 'he / she is', romanian: 'el / ea este' },
          { english: 'we are', romanian: 'noi suntem' },
          { english: 'they are', romanian: 'ei / ele sunt' },
        ],
        examples: [
          { english: 'I am in the kitchen.', romanian: 'Sunt în bucătărie.' },
          { english: 'You are in the bathroom.', romanian: 'Ești în baie.' },
          { english: 'The towel is in the bathroom.', romanian: 'Prosopul este în baie.' },
          { english: 'The plates are on the table.', romanian: 'Farfuriile sunt pe masă.' },
        ],
      },
      {
        id: 'have',
        infinitive: { english: 'to have', romanian: 'a avea' },
        forms: [
          { english: 'I have', romanian: 'eu am' },
          { english: 'you have', romanian: 'tu ai / dumneavoastră aveți' },
          { english: 'he / she has', romanian: 'el / ea are' },
          { english: 'we have', romanian: 'noi avem' },
          { english: 'they have', romanian: 'ei / ele au' },
        ],
        examples: [
          { english: 'I have a clean towel.', romanian: 'Am un prosop curat.' },
          { english: 'You have your phone.', romanian: 'Ai telefonul la tine.' },
          { english: 'She has a glass of water.', romanian: 'Ea are un pahar cu apă.' },
          { english: 'We have clean sheets.', romanian: 'Avem cearșafuri curate.' },
        ],
      },
    ],
    recall: [
      createQuestion({
        id: 'recall-be-meaning',
        prompt: 'Ce înseamnă „to be”?',
        promptLanguage: 'romanian',
        options: [
          { id: 'have', text: 'a avea' },
          { id: 'be', text: 'a fi' },
          { id: 'come', text: 'a veni' },
        ],
        correctOptionId: 'be',
        focusItemIds: ['verb-be'],
        explanationRomanian: '„To be” înseamnă „a fi”.',
      }),
      createQuestion({
        id: 'recall-have-sentence',
        prompt: 'Cum spui în engleză „Am un prosop curat”?',
        promptLanguage: 'romanian',
        options: [
          { id: 'need', text: 'I need a clean towel.' },
          { id: 'have', text: 'I have a clean towel.' },
          { id: 'want', text: 'I want a clean towel.' },
        ],
        correctOptionId: 'have',
        focusItemIds: ['verb-have'],
        explanationRomanian: '„Am un prosop curat” se spune „I have a clean towel”.',
      }),
    ],
  },
  {
    verbs: [
      {
        id: 'want',
        infinitive: { english: 'to want', romanian: 'a vrea' },
        forms: [
          { english: 'I want', romanian: 'eu vreau' },
          { english: 'you want', romanian: 'tu vrei / dumneavoastră vreți' },
          { english: 'he / she wants', romanian: 'el / ea vrea' },
          { english: 'we want', romanian: 'noi vrem' },
          { english: 'they want', romanian: 'ei / ele vor' },
        ],
        examples: [
          { english: 'I want some water.', romanian: 'Vreau puțină apă.' },
          { english: 'I want a clean towel.', romanian: 'Vreau un prosop curat.' },
          { english: 'She wants the clean shirt.', romanian: 'Ea vrea cămașa curată.' },
          { english: 'We want coffee.', romanian: 'Vrem cafea.' },
        ],
      },
      {
        id: 'need',
        infinitive: { english: 'to need', romanian: 'a avea nevoie' },
        forms: [
          { english: 'I need', romanian: 'eu am nevoie' },
          { english: 'you need', romanian: 'tu ai nevoie / dumneavoastră aveți nevoie' },
          { english: 'he / she needs', romanian: 'el / ea are nevoie' },
          { english: 'we need', romanian: 'noi avem nevoie' },
          { english: 'they need', romanian: 'ei / ele au nevoie' },
        ],
        examples: [
          { english: 'I need a towel.', romanian: 'Am nevoie de un prosop.' },
          { english: 'You need your phone.', romanian: 'Ai nevoie de telefonul tău.' },
          { english: 'He needs clean socks.', romanian: 'El are nevoie de șosete curate.' },
          { english: 'We need toilet paper.', romanian: 'Avem nevoie de hârtie igienică.' },
        ],
      },
    ],
    recall: [
      createQuestion({
        id: 'recall-want-sentence',
        prompt: 'Ce înseamnă „I want some water”?',
        promptLanguage: 'english',
        options: [
          { id: 'have', text: 'Am puțină apă.' },
          { id: 'need', text: 'Am nevoie de puțină apă.' },
          { id: 'want', text: 'Vreau puțină apă.' },
        ],
        correctOptionId: 'want',
        focusItemIds: ['verb-want'],
        explanationRomanian: '„I want some water” înseamnă „Vreau puțină apă”.',
      }),
      createQuestion({
        id: 'recall-need-sentence',
        prompt: 'Cum spui în engleză „Am nevoie de un prosop”?',
        promptLanguage: 'romanian',
        options: [
          { id: 'want', text: 'I want a towel.' },
          { id: 'need', text: 'I need a towel.' },
          { id: 'have', text: 'I have a towel.' },
        ],
        correctOptionId: 'need',
        focusItemIds: ['verb-need'],
        explanationRomanian: '„Am nevoie de un prosop” se spune „I need a towel”.',
      }),
    ],
  },
  {
    verbs: [
      {
        id: 'go',
        infinitive: { english: 'to go', romanian: 'a merge' },
        forms: [
          { english: 'I go', romanian: 'eu merg' },
          { english: 'you go', romanian: 'tu mergi / dumneavoastră mergeți' },
          { english: 'he / she goes', romanian: 'el / ea merge' },
          { english: 'we go', romanian: 'noi mergem' },
          { english: 'they go', romanian: 'ei / ele merg' },
        ],
        examples: [
          {
            english: 'I go upstairs every morning.',
            romanian: 'Urc la etaj în fiecare dimineață.',
          },
          { english: 'We go to the kitchen.', romanian: 'Mergem în bucătărie.' },
          { english: 'She goes to the bathroom.', romanian: 'Ea merge la baie.' },
          { english: 'I am going upstairs.', romanian: 'Urc la etaj.' },
        ],
      },
      {
        id: 'come',
        infinitive: { english: 'to come', romanian: 'a veni' },
        forms: [
          { english: 'I come', romanian: 'eu vin' },
          { english: 'you come', romanian: 'tu vii / dumneavoastră veniți' },
          { english: 'he / she comes', romanian: 'el / ea vine' },
          { english: 'we come', romanian: 'noi venim' },
          { english: 'they come', romanian: 'ei / ele vin' },
        ],
        examples: [
          { english: 'Come here, please.', romanian: 'Vino aici, te rog.' },
          { english: 'Come to the kitchen.', romanian: 'Vino în bucătărie.' },
          { english: 'He comes home at six.', romanian: 'El vine acasă la ora șase.' },
          { english: 'We come home after work.', romanian: 'Venim acasă după serviciu.' },
        ],
      },
    ],
    recall: [
      createQuestion({
        id: 'recall-go-sentence',
        prompt: 'Ce înseamnă „I am going upstairs”?',
        promptLanguage: 'english',
        options: [
          { id: 'come', text: 'Vin jos.' },
          { id: 'go', text: 'Urc la etaj.' },
          { id: 'stay', text: 'Rămân aici.' },
        ],
        correctOptionId: 'go',
        focusItemIds: ['verb-go'],
        explanationRomanian: '„I am going upstairs” înseamnă „Urc la etaj”.',
      }),
      createQuestion({
        id: 'recall-come-sentence',
        prompt: 'Cum spui în engleză „Vino aici, te rog”?',
        promptLanguage: 'romanian',
        options: [
          { id: 'go', text: 'Go upstairs, please.' },
          { id: 'wait', text: 'Wait here, please.' },
          { id: 'come', text: 'Come here, please.' },
        ],
        correctOptionId: 'come',
        focusItemIds: ['verb-come'],
        explanationRomanian: '„Vino aici, te rog” se spune „Come here, please”.',
      }),
    ],
  },
  {
    verbs: [
      {
        id: 'take',
        infinitive: { english: 'to take', romanian: 'a lua' },
        forms: [
          { english: 'I take', romanian: 'eu iau' },
          { english: 'you take', romanian: 'tu iei / dumneavoastră luați' },
          { english: 'he / she takes', romanian: 'el / ea ia' },
          { english: 'we take', romanian: 'noi luăm' },
          { english: 'they take', romanian: 'ei / ele iau' },
        ],
        examples: [
          { english: 'Take your phone.', romanian: 'Ia-ți telefonul.' },
          { english: 'Take a clean towel.', romanian: 'Ia un prosop curat.' },
          { english: 'I take a cup from the table.', romanian: 'Iau o cană de pe masă.' },
          { english: 'She takes a plate from the table.', romanian: 'Ea ia o farfurie de pe masă.' },
        ],
      },
      {
        id: 'put',
        infinitive: { english: 'to put', romanian: 'a pune' },
        forms: [
          { english: 'I put', romanian: 'eu pun' },
          { english: 'you put', romanian: 'tu pui / dumneavoastră puneți' },
          { english: 'he / she puts', romanian: 'el / ea pune' },
          { english: 'we put', romanian: 'noi punem' },
          { english: 'they put', romanian: 'ei / ele pun' },
        ],
        examples: [
          { english: 'Put the plate on the table.', romanian: 'Pune farfuria pe masă.' },
          { english: 'Put the milk in the fridge.', romanian: 'Pune laptele în frigider.' },
          {
            english: 'I put the phone next to the lamp.',
            romanian: 'Pun telefonul lângă lampă.',
          },
          {
            english: 'She puts the towels in the closet.',
            romanian: 'Ea pune prosoapele în dulap.',
          },
        ],
      },
    ],
    recall: [
      createQuestion({
        id: 'recall-take-sentence',
        prompt: 'Cum spui în engleză „Ia-ți telefonul”?',
        promptLanguage: 'romanian',
        options: [
          { id: 'put', text: 'Put your phone on the table.' },
          { id: 'take', text: 'Take your phone.' },
          { id: 'need', text: 'You need your phone.' },
        ],
        correctOptionId: 'take',
        focusItemIds: ['verb-take'],
        explanationRomanian: '„Ia-ți telefonul” se spune „Take your phone”.',
      }),
      createQuestion({
        id: 'recall-put-sentence',
        prompt: 'Ce înseamnă „Put the plate on the table”?',
        promptLanguage: 'english',
        options: [
          { id: 'take', text: 'Ia farfuria de pe masă.' },
          { id: 'wash', text: 'Spală farfuria la chiuvetă.' },
          { id: 'put', text: 'Pune farfuria pe masă.' },
        ],
        correctOptionId: 'put',
        focusItemIds: ['verb-put'],
        explanationRomanian: '„Put the plate on the table” înseamnă „Pune farfuria pe masă”.',
      }),
    ],
  },
] as const satisfies readonly VerbGroup[];

const verbs: readonly VerbItem[] = verbGroups.flatMap(
  (group): readonly VerbItem[] => group.verbs,
);
const audioByVerbId = new Map(
  verbs.map((verb) => [
    verb.id,
    {
      infinitive: createAudioSource(`essential-verbs-1-word-${verb.id}`, verb.infinitive.english),
      examples: verb.examples.map((example, index) =>
        createAudioSource(`essential-verbs-1-example-${verb.id}-${index + 1}`, example.english),
      ),
    },
  ]),
);

export const essentialVerbsOneLesson = {
  id: 'level-2-essential-verbs-1',
  schemaVersion: 1,
  title: {
    english: 'Essential Verbs I',
    romanian: 'Verbe esențiale I',
  },
  descriptionRomanian: 'Învață 8 verbe esențiale prin forme scurte și exemple de acasă.',
  estimatedMinutes: 25,
  prerequisiteLessonIds: ['level-1-cleaning-basics'],
  activities: verbGroups.flatMap((group) => [
    ...group.verbs.flatMap(createVerbActivities),
    ...group.recall,
  ]),
} satisfies Lesson;

export const essentialVerbsOneAudioSources = [...audioByVerbId.values()].flatMap(
  ({ infinitive, examples }) => [infinitive, ...examples],
);

function createVerbActivities(
  verb: VerbItem,
): readonly [VocabularyIntroductionActivity, ...ExampleSentenceActivity[]] {
  const audio = audioByVerbId.get(verb.id);
  if (!audio) {
    throw new Error(`Missing audio sources for verb: ${verb.id}`);
  }

  return [
    {
      id: `introduce-${verb.id}`,
      type: 'vocabulary-introduction',
      instructionRomanian: 'Ascultă infinitivul și observă formele folosite des.',
      vocabularyId: `verb-${verb.id}`,
      content: verb.infinitive,
      forms: verb.forms,
      audio: audio.infinitive,
      examples: verb.examples.map((example, index) => ({
        ...example,
        audio: audio.examples[index],
      })),
    },
    ...verb.examples.map(
      (example, index) =>
        ({
          id: `example-${verb.id}-${index + 1}`,
          type: 'example-sentence',
          instructionRomanian: 'Ascultă propoziția. Observă verbul în context.',
          sentence: { ...example, audio: audio.examples[index] },
          focusItemIds: [`verb-${verb.id}`],
        }) satisfies ExampleSentenceActivity,
    ),
  ];
}

type QuestionInput = Omit<MultipleChoiceActivity, 'type' | 'instructionRomanian'>;

function createQuestion(question: QuestionInput): MultipleChoiceActivity {
  return {
    ...question,
    type: 'multiple-choice',
    instructionRomanian: 'Alege răspunsul corect.',
  };
}

function createAudioSource(key: string, text: string): AudioSource {
  return {
    key,
    text,
    locale: 'en-US',
    rate: 0.85,
  };
}
