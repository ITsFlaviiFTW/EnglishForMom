# Prava

Practical everyday English for a Romanian-speaking adult beginner, explained in
Romanian. Built with Expo + React Native and published as an installable web
app (PWA) at <https://english.flavstudios.dev>.

On iPhone: open the site in Safari → **Share** → **Add to Home Screen**. The
home screen shows these steps in Romanian the first time.

## Development

```bash
npm install
npm start          # Expo dev server (press w for web)
```

Checks:

```bash
npm test
npm run typecheck
npm run lint
```

## Web build and deploy

```bash
npm run build:web          # static PWA in dist/
bash deploy/deploy.sh      # build + publish to the server (ssh alias flav-vps)
bash deploy/rollback.sh    # switch back to the previous release
```

- The server keeps the last 5 releases in `/srv/apps/prava/releases/`;
  `/srv/apps/prava/current` points at the live one. Nginx serves it as static
  files (`deploy/nginx-prava.conf`); there is no app server and no database.
- HTTPS is a Let's Encrypt certificate that renews automatically.
- `public/sw.js` keeps pages and the app script available offline and caches
  each audio file the first time it plays.
- Progress is stored on the device (browser storage). Clearing Safari's website
  data, or using a different phone, starts from zero.

## Other scripts

All lesson audio is made with Azure Speech: the natural US English voice Ava
(`en-US-AvaNeural`), Canadian voices for store staff in dialogues, and the
Romanian voice Alina (`ro-RO-AlinaNeural`).

- `npm run generate-all-audio`: runs the three commands below, in order.
- `npm run generate-audio`: the English recording of every lesson word and
  phrase ("Ascultă"; "Mai rar" plays the same file slower), plus the
  real-speed shop dialogues in the "În oraș" lessons, where store staff speak
  with a Canadian voice (`en-CA-ClaraNeural` / `en-CA-LiamNeural`).
- `npm run generate-spaced-audio`: the word-by-word ("Cuvânt cu cuvânt") MP3s,
  with the timing of each word for highlighting.
- `npm run generate-accent-audio`: the Romanian-accent MP3s, the main way the
  app says each word and sentence ("Ascultă"; "Mai rar" plays it slower). Alina
  reads each phrase spelled the Romanian way, from
  `src/data/audio/romanian-accent-respellings.ts`, which is also shown as
  "Se citește". The normal English is a separate, smaller button below.

They need `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` in `.env.local`
(git-ignored; the key never goes into the app). Every reading is cached in
`.tools/speech-cache`, so only new or changed text is sent to Azure. The whole
course is roughly 10,000 characters; the free tier allows 500,000 a month.
Joining and MP3 encoding use Python 3 (a small venv in `.tools/audio-venv` is
set up automatically).

- `npm run generate-print`: makes the printable PDFs in `public/print/` from the
  lesson data (one workbook per course with word list, handwriting, exercises,
  dictation, dialogue role-play and answers; the conversation scripts to act
  out with family; a pocket card; house labels for Avery 5160 sheets). Uses
  Microsoft Edge or Google Chrome to print, trying the next one if a browser
  fails (for example in the middle of an update). They are published with the
  site at `/print/<file>.pdf`.

## Conversations ("Conversații")

Talk-back practice with different people: a store worker, a cashier, a
neighbour, a delivery driver, a phone call, a pharmacist, a clinic receptionist
and a bus driver (`src/data/lessons/conversations.ts`). Each conversation is a
lesson with one step per thing she says: the other person speaks at real speed
(four voices), she gets a task in Romanian, tries to answer from memory (or
taps "Arată ce să spui"), and the speaking check unlocks the next step.

- Her answers are recorded like lesson phrases, so they have the
  Romanian-accent recording, "Se citește" and word by word. Every answer needs a
  spelling in `romanian-accent-respellings.ts`; each was checked by running
  Alina's reading through the speaking check.
- The other person's lines are recorded by `npm run generate-audio`, with the
  voices in `STAFF_VOICES` (`scripts/audio-tools.mjs`).
- The phone call asks for "Daniel": change the name in `conversations.ts` to
  someone in the family.
- `python scripts/generate-icons.py`: redraws the app icons (needs Pillow).

## Speaking check ("Acum spune tu")

On every new word and example sentence she taps the microphone and says it;
Continue unlocks once she says it right. After 5 tries "Sari peste" lets her
move on, and the item goes to "Repetă". Without a microphone, internet or the
check itself, the step works as before.

- The phone records a short 16 kHz WAV and posts it to `/api/pronunciation`
  on the same site. Nginx forwards it to Azure's speech recognition with
  pronunciation assessment and adds the Azure key there, from
  `/etc/nginx/prava-secrets/speech.conf` on the server. The key is never in
  the app or in git.
- `bash deploy/install-speech-key.sh` writes that file from `.env.local` over
  SSH (run it once, and again if the key changes).
- Nginx limits the endpoint to 20 checks a minute per phone and 60 for the
  whole site. Azure's free tier covers about 5 hours of speech a month; if it
  runs out, the check reports a problem and she can continue.
- The pass rules are in `src/features/speaking/pronunciation.ts`. They were set
  with Azure's scores for the app's own recordings: native English and the
  Romanian-accent readings pass, a different phrase never does.
- iPhone's built-in speech recognition (Web Speech API) is not used: it does
  not work in apps added to the Home Screen.

## Roadmap

See `docs/ai-tutor-options.md` for the researched plan for the bilingual AI tutor.
