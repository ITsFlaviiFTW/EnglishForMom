import { createHomeVocabularyLesson } from './create-home-vocabulary-lesson.ts';

const livingRoomBasics = createHomeVocabularyLesson({
  id: 'level-1-living-room-basics',
  title: {
    english: 'Living Room Basics',
    romanian: 'Sufrageria: cuvinte de bază',
  },
  descriptionRomanian: 'Învață 14 cuvinte practice pentru obiectele din sufragerie.',
  estimatedMinutes: 18,
  prerequisiteLessonIds: ['level-1-bedroom-basics'],
  audioKeyPrefix: 'living-room',
  groups: [
    {
      items: [
        {
          id: 'sofa',
          word: { english: 'sofa', romanian: 'canapea' },
          example: { english: 'Sit on the sofa.', romanian: 'Așază-te pe canapea.' },
        },
        {
          id: 'armchair',
          word: { english: 'armchair', romanian: 'fotoliu' },
          example: {
            english: 'The armchair is next to the sofa.',
            romanian: 'Fotoliul este lângă canapea.',
          },
        },
        {
          id: 'coffee-table',
          word: { english: 'coffee table', romanian: 'măsuță de cafea' },
          example: {
            english: 'The cup is on the coffee table.',
            romanian: 'Cana este pe măsuța de cafea.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-sofa-ro',
          direction: 'english-to-romanian',
          answerItemId: 'sofa',
          optionItemIds: ['armchair', 'coffee-table', 'sofa'],
        },
        {
          id: 'recall-armchair-en',
          direction: 'romanian-to-english',
          answerItemId: 'armchair',
          optionItemIds: ['sofa', 'armchair', 'coffee-table'],
        },
      ],
    },
    {
      items: [
        {
          id: 'tv',
          word: { english: 'TV', romanian: 'televizor' },
          example: {
            english: 'The TV is in front of the sofa.',
            romanian: 'Televizorul este în fața canapelei.',
          },
        },
        {
          id: 'remote-control',
          word: { english: 'remote control', romanian: 'telecomandă' },
          example: {
            english: 'The remote control is on the coffee table.',
            romanian: 'Telecomanda este pe măsuța de cafea.',
          },
        },
        {
          id: 'rug',
          word: { english: 'rug', romanian: 'covor' },
          example: {
            english: 'The rug is under the coffee table.',
            romanian: 'Covorul este sub măsuța de cafea.',
          },
        },
      ],
      recall: [
        {
          id: 'recall-remote-control-ro',
          direction: 'english-to-romanian',
          answerItemId: 'remote-control',
          optionItemIds: ['rug', 'tv', 'remote-control'],
        },
        {
          id: 'recall-tv-en',
          direction: 'romanian-to-english',
          answerItemId: 'tv',
          optionItemIds: ['remote-control', 'tv', 'rug'],
        },
      ],
    },
    {
      items: [
        {
          id: 'curtains',
          word: { english: 'curtains', romanian: 'perdele' },
          example: {
            english: 'The curtains are by the window.',
            romanian: 'Perdelele sunt lângă fereastră.',
          },
        },
        {
          id: 'lamp',
          word: { english: 'lamp', romanian: 'lampă' },
          example: { english: 'The lamp is next to the sofa.', romanian: 'Lampa este lângă canapea.' },
        },
        {
          id: 'window',
          word: { english: 'window', romanian: 'fereastră' },
          example: { english: 'Open the window.', romanian: 'Deschide fereastra.' },
        },
      ],
      recall: [
        {
          id: 'recall-curtains-ro',
          direction: 'english-to-romanian',
          answerItemId: 'curtains',
          optionItemIds: ['lamp', 'curtains', 'window'],
        },
        {
          id: 'recall-window-en',
          direction: 'romanian-to-english',
          answerItemId: 'window',
          optionItemIds: ['curtains', 'window', 'lamp'],
        },
      ],
    },
    {
      items: [
        {
          id: 'door',
          word: { english: 'door', romanian: 'ușă' },
          example: {
            english: 'Close the living room door.',
            romanian: 'Închide ușa de la sufragerie.',
          },
        },
        {
          id: 'shelf',
          word: { english: 'shelf', romanian: 'raft' },
          example: { english: 'The books are on the shelf.', romanian: 'Cărțile sunt pe raft.' },
        },
        {
          id: 'book',
          word: { english: 'book', romanian: 'carte' },
          example: { english: 'The book is on the sofa.', romanian: 'Cartea este pe canapea.' },
        },
      ],
      recall: [
        {
          id: 'recall-shelf-ro',
          direction: 'english-to-romanian',
          answerItemId: 'shelf',
          optionItemIds: ['book', 'door', 'shelf'],
        },
        {
          id: 'recall-book-en',
          direction: 'romanian-to-english',
          answerItemId: 'book',
          optionItemIds: ['shelf', 'book', 'door'],
        },
      ],
    },
    {
      items: [
        {
          id: 'picture',
          word: { english: 'picture', romanian: 'tablou' },
          example: {
            english: 'The picture is above the sofa.',
            romanian: 'Tabloul este deasupra canapelei.',
          },
        },
        {
          id: 'clock',
          word: { english: 'clock', romanian: 'ceas' },
          example: { english: 'The clock is on the wall.', romanian: 'Ceasul este pe perete.' },
        },
      ],
      recall: [
        {
          id: 'recall-picture-ro',
          direction: 'english-to-romanian',
          answerItemId: 'picture',
          optionItemIds: ['clock', 'picture', 'book'],
        },
        {
          id: 'recall-clock-en',
          direction: 'romanian-to-english',
          answerItemId: 'clock',
          optionItemIds: ['picture', 'shelf', 'clock'],
        },
      ],
    },
  ],
  practiceActivities: [
    {
      id: 'fill-living-room-coffee-table',
      type: 'fill-in-the-blank',
      instructionRomanian: 'Alege cuvântul care completează propoziția.',
      sentence: 'The remote control is on the ___.',
      completedSentence: 'The remote control is on the coffee table.',
      translationRomanian: 'Telecomanda este pe măsuța de cafea.',
      options: [
        { id: 'coffee-table', text: 'coffee table' },
        { id: 'window', text: 'window' },
        { id: 'shelf', text: 'shelf' },
      ],
      acceptedAnswers: ['coffee table'],
      focusItemIds: ['coffee-table'],
    },
  ],
});

export const livingRoomBasicsLesson = livingRoomBasics.lesson;
export const livingRoomBasicsAudioSources = livingRoomBasics.audioSources;
