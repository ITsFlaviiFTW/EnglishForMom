import { createConversation } from './create-conversation.ts';

/**
 * Talk-back conversations: the app plays the other person at real speed, and
 * she answers out loud. Her answers are short (six words at most) and are
 * phrases from the "În oraș" lessons wherever they fit, so she practises what
 * she has already learned.
 */
const conversations = [
  createConversation({
    id: 'talk-1-store-help',
    slug: 'store',
    title: { english: 'Asking for Help in the Store', romanian: 'Ceri ajutor în magazin' },
    descriptionRomanian: 'Întrebi un angajat unde e laptele.',
    partner: { nameRomanian: 'Angajatul', icon: '🧑‍💼', voice: 'male' },
    situationRomanian:
      'Ești în magazin și cauți laptele. Vezi un angajat. Tu vorbești prima: întreabă-l.',
    turns: [
      {
        task: 'Întreabă-l unde e laptele.',
        say: {
          english: 'Excuse me, where is the milk?',
          romanian: 'Scuzați-mă, unde este laptele?',
        },
      },
      {
        partner: [
          {
            english: 'The milk is in aisle five, at the back of the store.',
            romanian: 'Laptele e pe culoarul cinci, în spatele magazinului.',
          },
        ],
        task: 'A vorbit repede. Spune „Poftim?”.',
        say: { english: 'Sorry?', romanian: 'Poftim?' },
      },
      {
        partner: [
          {
            english: 'Sure! Aisle five. Just go straight to the back.',
            romanian: 'Sigur! Culoarul cinci. Mergeți drept înainte, până în spate.',
          },
        ],
        task: 'Mulțumește-i.',
        say: { english: 'Thank you very much.', romanian: 'Mulțumesc foarte mult.' },
      },
    ],
    closing: [{ english: "You're welcome. Have a good day!", romanian: 'Cu plăcere. O zi bună!' }],
  }),

  createConversation({
    id: 'talk-2-checkout',
    slug: 'checkout',
    title: { english: 'Paying at the Checkout', romanian: 'Plătești la casă' },
    descriptionRomanian: 'Toată discuția cu casiera, de la salut până la bon.',
    partner: { nameRomanian: 'Casiera', icon: '👩‍💼', voice: 'female' },
    situationRomanian:
      'Ai pus cumpărăturile pe bandă și casiera începe să vorbească. Ascultă și răspunde cu voce tare.',
    turns: [
      {
        partner: [{ english: 'Hi! How are you today?', romanian: 'Bună! Ce mai faceți azi?' }],
        task: 'Spune că ești bine și întreab-o și pe ea.',
        say: { english: 'Good, thanks. And you?', romanian: 'Bine, mulțumesc. Dumneavoastră?' },
      },
      {
        partner: [
          {
            english: "I'm good, thanks! Did you find everything okay?",
            romanian: 'Bine, mulțumesc! Ați găsit tot ce căutați?',
          },
        ],
        task: 'Spune că da, ai găsit tot.',
        say: { english: 'Yes, I did. Thank you.', romanian: 'Da, am găsit. Mulțumesc.' },
      },
      {
        partner: [
          { english: 'Great. Do you need a bag today?', romanian: 'Super. Aveți nevoie de o pungă azi?' },
        ],
        task: 'Spune că nu, mulțumești.',
        say: { english: 'No, thank you.', romanian: 'Nu, mulțumesc.' },
      },
      {
        partner: [
          {
            english: 'Okay. Your total is fourteen twenty-five. Debit or credit?',
            romanian: 'Bine. Totalul este 14,25 de dolari. Debit sau credit?',
          },
        ],
        task: 'Spune că plătești cu debit.',
        say: { english: 'Debit, please.', romanian: 'Debit, vă rog.' },
      },
      {
        partner: [
          {
            english: 'Go ahead and tap your card. Do you want your receipt?',
            romanian: 'Apropiați cardul. Vreți bonul?',
          },
        ],
        task: 'Spune că da, vrei bonul.',
        say: { english: 'Yes, please.', romanian: 'Da, vă rog.' },
      },
      {
        partner: [{ english: 'Here you go. Have a good one!', romanian: 'Poftiți. O zi bună!' }],
        task: 'Mulțumește-i și urează-i și tu o zi bună.',
        say: { english: 'Thanks, you too!', romanian: 'Mulțumesc, la fel!' },
      },
    ],
  }),

  createConversation({
    id: 'talk-3-neighbour',
    slug: 'neighbour',
    title: { english: 'Talking with a Neighbour', romanian: 'Vorbești cu vecina' },
    descriptionRomanian: 'Câteva vorbe pe stradă, cu vecina.',
    partner: { nameRomanian: 'Vecina', icon: '👩‍🦳', voice: 'female-2' },
    situationRomanian:
      'Ieși din casă și o întâlnești pe vecina ta. Ea te salută. Ascultă și răspunde cu voce tare.',
    turns: [
      {
        partner: [{ english: 'Good morning! How are you?', romanian: 'Bună dimineața! Ce mai faceți?' }],
        task: 'Spune că ești bine și întreab-o și pe ea.',
        say: { english: 'Good, thanks. And you?', romanian: 'Bine, mulțumesc. Dumneavoastră?' },
      },
      {
        partner: [
          {
            english: "I'm great, thanks. It's a beautiful day today!",
            romanian: 'Foarte bine, mulțumesc. E o zi frumoasă azi!',
          },
        ],
        task: 'Spune că da, e foarte frumos.',
        say: { english: "Yes, it's very nice.", romanian: 'Da, e foarte frumos.' },
      },
      {
        partner: [{ english: 'Are you going for a walk?', romanian: 'Mergeți la plimbare?' }],
        task: 'Spune că nu, mergi la magazin.',
        say: { english: 'No, to the store.', romanian: 'Nu, la magazin.' },
      },
      {
        partner: [
          { english: 'Oh, nice! Well, have a good day!', romanian: 'A, ce bine! Atunci, o zi bună!' },
        ],
        task: 'Mulțumește-i și urează-i și tu o zi bună.',
        say: { english: 'Thanks, you too!', romanian: 'Mulțumesc, la fel!' },
      },
    ],
  }),

  createConversation({
    id: 'talk-4-delivery',
    slug: 'delivery',
    title: { english: 'A Delivery at the Door', romanian: 'Curierul la ușă' },
    descriptionRomanian: 'Un curier îți aduce un pachet acasă.',
    partner: { nameRomanian: 'Curierul', icon: '📦', voice: 'male-2' },
    situationRomanian:
      'Sună cineva la ușă. E un curier cu un pachet. Ascultă ce spune și răspunde cu voce tare.',
    turns: [
      {
        partner: [
          {
            english: 'Hi there! Is this twenty-five Maple Street?',
            romanian: 'Bună ziua! Aici e strada Maple, numărul 25?',
          },
        ],
        task: 'Spune că da.',
        say: { english: 'Yes, it is.', romanian: 'Da, aici e.' },
      },
      {
        partner: [
          { english: 'Great. I have a package for you.', romanian: 'Super. Am un pachet pentru dumneavoastră.' },
        ],
        task: 'Mulțumește-i.',
        say: { english: 'Oh, thank you!', romanian: 'A, mulțumesc!' },
      },
      {
        partner: [{ english: 'Can you sign here, please?', romanian: 'Puteți semna aici, vă rog?' }],
        task: 'Spune că da și întreabă unde semnezi.',
        say: { english: 'Yes. Where do I sign?', romanian: 'Da. Unde semnez?' },
      },
      {
        partner: [
          {
            english: 'Right here, on the screen. Perfect, thanks! Have a nice day!',
            romanian: 'Chiar aici, pe ecran. Perfect, mulțumesc! O zi bună!',
          },
        ],
        task: 'Mulțumește-i și urează-i și tu o zi bună.',
        say: { english: 'Thanks, you too!', romanian: 'Mulțumesc, la fel!' },
      },
    ],
  }),

  createConversation({
    id: 'talk-5-phone',
    slug: 'phone',
    title: { english: 'Answering the Phone', romanian: 'Răspunzi la telefon' },
    descriptionRomanian: 'Cineva sună și caută pe cineva care nu e acasă.',
    partner: { nameRomanian: 'La telefon', icon: '📞', voice: 'female' },
    situationRomanian:
      'Sună telefonul acasă. Cineva îl caută pe Daniel, care nu e acasă. Tu vorbești prima: răspunde la telefon.',
    turns: [
      {
        task: 'Răspunde la telefon.',
        say: { english: 'Hello?', romanian: 'Alo?' },
      },
      {
        partner: [
          {
            english: 'Hi! Can I speak to Daniel, please?',
            romanian: 'Bună ziua! Pot să vorbesc cu Daniel, vă rog?',
          },
        ],
        task: 'Spune că nu e acasă.',
        say: { english: "Sorry, he's not home.", romanian: 'Îmi pare rău, nu e acasă.' },
      },
      {
        partner: [{ english: 'Oh, okay. Can I leave a message?', romanian: 'A, bine. Pot să las un mesaj?' }],
        task: 'Spune că vorbești puțină engleză.',
        say: { english: 'I speak a little English.', romanian: 'Vorbesc puțină engleză.' },
      },
      {
        partner: [
          {
            english: "No problem. I'll call back later. Bye!",
            romanian: 'Nicio problemă. Sun mai târziu. La revedere!',
          },
        ],
        task: 'Mulțumește-i și spune la revedere.',
        say: { english: 'Thank you. Bye!', romanian: 'Mulțumesc. La revedere!' },
      },
    ],
  }),

  createConversation({
    id: 'talk-6-pharmacy',
    slug: 'pharmacy',
    title: { english: 'At the Pharmacy', romanian: 'La farmacie' },
    descriptionRomanian: 'Ceri ceva pentru răceală și înțelegi cum se ia.',
    partner: { nameRomanian: 'Farmacistul', icon: '🧑‍⚕️', voice: 'male' },
    situationRomanian:
      'Ești răcită și mergi la farmacie. Farmacistul te întreabă ce dorești. Ascultă și răspunde cu voce tare.',
    turns: [
      {
        partner: [{ english: 'Hi! How can I help you?', romanian: 'Bună ziua! Cu ce vă pot ajuta?' }],
        task: 'Spune că vrei ceva pentru răceală.',
        say: { english: 'For a cold, please.', romanian: 'Pentru răceală, vă rog.' },
      },
      {
        partner: [{ english: 'Sure. Do you have a fever?', romanian: 'Sigur. Aveți febră?' }],
        task: 'Spune că nu.',
        say: { english: "No, I don't.", romanian: 'Nu, nu am.' },
      },
      {
        partner: [
          {
            english: 'Okay. Try this one. Take one pill two times a day, with food.',
            romanian: 'Bine. Încercați-l pe acesta. Luați o pastilă de două ori pe zi, cu mâncare.',
          },
        ],
        task: 'A vorbit repede. Roagă-l să vorbească mai rar.',
        say: { english: 'Slowly, please.', romanian: 'Mai rar, vă rog.' },
      },
      {
        partner: [
          {
            english: 'Of course. One pill... two times a day... with food.',
            romanian: 'Desigur. O pastilă... de două ori pe zi... cu mâncare.',
          },
        ],
        task: 'Mulțumește-i frumos.',
        say: { english: 'Thank you very much.', romanian: 'Mulțumesc foarte mult.' },
      },
    ],
    closing: [
      { english: "You're welcome. Feel better soon!", romanian: 'Cu plăcere. Însănătoșire grabnică!' },
    ],
  }),

  createConversation({
    id: 'talk-7-clinic',
    slug: 'clinic',
    title: { english: 'At the Clinic', romanian: 'La clinică' },
    descriptionRomanian: 'La recepție, înainte să intri la doctor.',
    partner: { nameRomanian: 'Recepționera', icon: '👩‍⚕️', voice: 'female-2' },
    situationRomanian:
      'Ai programare la doctor. La recepție, o doamnă îți pune câteva întrebări. Ascultă și răspunde cu voce tare.',
    turns: [
      {
        partner: [{ english: 'Hi! Do you have an appointment?', romanian: 'Bună ziua! Aveți programare?' }],
        task: 'Spune că da, la ora zece.',
        say: { english: "Yes, at ten o'clock.", romanian: 'Da, la ora zece.' },
      },
      {
        partner: [
          {
            english: 'Okay. Can I see your health card, please?',
            romanian: 'Bine. Pot să văd cardul de sănătate, vă rog?',
          },
        ],
        task: 'Dă-i cardul și spune „Poftiți”.',
        say: { english: 'Yes, here you go.', romanian: 'Da, poftiți.' },
      },
      {
        partner: [
          {
            english: 'Thank you. Please have a seat. The doctor will call your name.',
            romanian: 'Mulțumesc. Luați loc, vă rog. Doctorul vă va striga pe nume.',
          },
        ],
        task: 'N-ai înțeles tot. Spune că nu înțelegi.',
        say: { english: "Sorry, I don't understand.", romanian: 'Îmi pare rău, nu înțeleg.' },
      },
      {
        partner: [
          {
            english: 'Sure. Please sit down and wait. The doctor will call you.',
            romanian: 'Sigur. Vă rog să luați loc și să așteptați. Doctorul vă va chema.',
          },
        ],
        task: 'Spune că ai înțeles și mulțumește-i.',
        say: { english: 'Okay, thank you.', romanian: 'Bine, mulțumesc.' },
      },
    ],
  }),

  createConversation({
    id: 'talk-8-bus',
    slug: 'bus',
    title: { english: 'On the Bus', romanian: 'În autobuz' },
    descriptionRomanian: 'Întrebi șoferul unde merge autobuzul și cât costă.',
    partner: { nameRomanian: 'Șoferul', icon: '🚌', voice: 'male-2' },
    situationRomanian:
      'Urci în autobuz și vrei să mergi la mall. Tu vorbești prima cu șoferul, apoi ascultă și răspunde.',
    turns: [
      {
        task: 'Întreabă-l dacă merge la mall.',
        say: { english: 'To the mall?', romanian: 'La mall?' },
      },
      {
        partner: [{ english: 'Yes, it does.', romanian: 'Da, merge.' }],
        task: 'Întreabă cât costă.',
        say: { english: 'How much is it?', romanian: 'Cât costă?' },
      },
      {
        partner: [
          {
            english: "It's three fifty. You can tap your card right here.",
            romanian: 'Costă 3,50 de dolari. Puteți apropia cardul chiar aici.',
          },
        ],
        task: 'N-ai auzit bine. Spune „Poftim?”.',
        say: { english: 'Sorry?', romanian: 'Poftim?' },
      },
      {
        partner: [
          {
            english: 'Three dollars and fifty cents. Tap your card here.',
            romanian: 'Trei dolari și cincizeci de cenți. Apropiați cardul aici.',
          },
        ],
        task: 'Spune că ai înțeles și mulțumește-i.',
        say: { english: 'Okay, thank you.', romanian: 'Bine, mulțumesc.' },
      },
    ],
  }),
];

export const conversationLessons = conversations.map(({ lesson }) => lesson);
/** Her answers: recorded like lesson phrases (normal, Romanian accent, word by word). */
export const conversationResponseAudioSources = conversations.flatMap(
  ({ responseSources }) => responseSources,
);
/** The other person's lines, at real speed in their own voice. */
export const conversationPartnerAudioSources = conversations.flatMap(
  ({ partnerSources }) => partnerSources,
);
