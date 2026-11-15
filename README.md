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
- `npm run generate-accent-audio`: the "Cu accent românesc" MP3s. Alina reads
  each phrase spelled the Romanian way, from
  `src/data/audio/romanian-accent-respellings.ts`, then Ava says it normally.

They need `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` in `.env.local`
(git-ignored; the key never goes into the app). Every reading is cached in
`.tools/speech-cache`, so only new or changed text is sent to Azure. The whole
course is roughly 10,000 characters; the free tier allows 500,000 a month.
Joining and MP3 encoding use Python 3 (a small venv in `.tools/audio-venv` is
set up automatically).

- `npm run generate-print`: makes the printable PDFs in `public/print/` from the
  lesson data (one workbook per course with word list, handwriting, exercises,
  dictation, dialogue role-play and answers; a pocket card; house labels for
  Avery 5160 sheets). Uses Microsoft Edge or Google Chrome to print. They are
  published with the site at `/print/<file>.pdf`.
- `python scripts/generate-icons.py`: redraws the app icons (needs Pillow).

## Roadmap

See `docs/ai-tutor-options.md` for the researched plan for the bilingual AI tutor.
