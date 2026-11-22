// Makes the printable material, from the same lesson data as the app:
// - one workbook per course: word list, handwriting, exercises, dictation,
//   dialogue role-play, and the answers at the end;
// - a pocket card with the phrases she needs at the store;
// - sticky labels for things around the house.
// Pages are written as HTML and printed to PDF with Microsoft Edge (or Chrome).
//   npm run generate-print
// Output: public/print/*.pdf (published with the site at /print/...).
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { romanianAccentRespellings } from '../src/data/audio/romanian-accent-respellings.ts';
import { getCourses } from '../src/data/courses/course-catalog.ts';
import { getLessonById } from '../src/data/lessons/lesson-catalog.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlDirectory = join(projectRoot, '.tools', 'print-html');
const outputDirectory = join(projectRoot, 'public', 'print');

const WORKBOOK_FILES = {
  'out-and-about': 'prava-workbook-1-out-and-about.pdf',
  'my-home': 'prava-workbook-2-my-home.pdf',
  'everyday-actions': 'prava-workbook-3-everyday-actions.pdf',
};
// Home words that are not things you can stick a label on.
const NOT_LABELS = new Set(['wash', 'dry', 'clean', 'dirty', 'dust', 'dirty clothes', 'clean clothes']);

const browsers = findBrowsers();
await rm(htmlDirectory, { recursive: true, force: true });
await mkdir(htmlDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });

const courses = getCourses().map((course) => ({
  course,
  lessons: course.units.flatMap((unit) => {
    const lesson = unit.lessonId ? getLessonById(unit.lessonId) : undefined;
    return lesson ? [toPrintLesson(lesson, unit.icon)] : [];
  }),
}));

for (const { course, lessons } of courses) {
  const fileName = WORKBOOK_FILES[course.id];
  if (fileName && lessons.length > 0) {
    await printPdf(fileName, workbookHtml(course, lessons));
  }
}
const conversationCourse = getCourses().find((course) => course.id === 'conversations');
if (conversationCourse) {
  await printPdf('prava-conversations.pdf', conversationsHtml(conversationCourse));
}
await printPdf('prava-pocket-card.pdf', pocketCardHtml());
await printPdf(
  'prava-house-labels.pdf',
  houseLabelsHtml(courses.find(({ course }) => course.id === 'my-home')?.lessons ?? []),
);
console.log(`\nDone: PDFs are in ${outputDirectory}`);

// ---------------------------------------------------------------- data

function toPrintLesson(lesson, icon) {
  const items = lesson.activities
    .filter((activity) => activity.type === 'vocabulary-introduction')
    .map((activity) => ({
      id: activity.vocabularyId,
      english: activity.content.english,
      romanian: activity.content.romanian,
      respelling: romanianAccentRespellings[activity.content.english] ?? '',
      note: activity.noteRomanian,
      forms: activity.forms ?? [],
      examples: activity.examples ?? [],
    }));
  const dialogues = lesson.activities
    .filter((activity) => activity.type === 'listening')
    .map((activity) => activity.transcript);
  return { id: lesson.id, icon, title: lesson.title, items, dialogues };
}

/** Same order every time for the same lesson (so the answers never change). */
function shuffled(list, seedText) {
  let seed = [...seedText].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  const random = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function exercisesFor(lesson) {
  const matchItems = lesson.items.slice(0, 6);
  const matchRomanian = shuffled(matchItems, `${lesson.id}-match`);
  const letters = 'abcdef';

  // Fill in: a short word or two that appears in its own example sentence.
  const fill = lesson.items.flatMap((item) => {
    const word = item.english.replace(/[.?!]+$/, '');
    const example = item.examples[0]?.english;
    if (!example || word.split(/\s+/).length > 2) {
      return [];
    }
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (!pattern.test(example)) {
      return [];
    }
    return [{ word, sentence: example.replace(pattern, '__________'), answer: example }];
  });
  // Two identical blanked sentences would have two right answers: keep one.
  const uniqueFill = fill.filter(
    (candidate, index) => fill.findIndex((other) => other.sentence === candidate.sentence) === index,
  );
  const fillItems = shuffled(uniqueFill, `${lesson.id}-fill`).slice(0, 5);
  const hasFill = fillItems.length >= 2;

  // Translate: items that were not in the matching exercise first.
  const rest = lesson.items.filter((item) => !matchItems.includes(item));
  const translateItems = [...rest, ...[...matchItems].reverse()].slice(0, hasFill ? 4 : 5);

  const dictation = lesson.items
    .map((item) => item.examples[0])
    .filter(Boolean)
    .slice(0, 8);

  return {
    match: matchItems.map((item, index) => ({ number: index + 1, english: item.english })),
    matchOptions: matchRomanian.map((item, index) => ({ letter: letters[index], text: item.romanian })),
    matchAnswers: matchItems.map(
      (item, index) => `${index + 1}–${letters[matchRomanian.indexOf(item)]}`,
    ),
    fill: hasFill ? fillItems : [],
    wordBank: shuffled(
      fillItems.map(({ word }) => word),
      `${lesson.id}-bank`,
    ),
    translate: translateItems,
    dictation,
  };
}

// ---------------------------------------------------------------- pages

function workbookHtml(course, lessons) {
  const lessonPages = lessons.map((lesson, index) => lessonHtml(lesson, index + 1)).join('');
  const answers = lessons
    .map((lesson, index) => {
      const ex = exercisesFor(lesson);
      return `
        <section class="answers-lesson">
          <h3>Lecția ${index + 1} · ${esc(lesson.title.romanian)}</h3>
          <p><b>Unește:</b> ${ex.matchAnswers.join(', ')}</p>
          ${ex.fill.length ? `<p><b>Completează:</b> ${ex.fill.map((f) => esc(f.answer)).join(' · ')}</p>` : ''}
          <p><b>Tradu:</b> ${ex.translate.map((item) => `${esc(item.romanian)} = <i>${esc(item.english)}</i>`).join(' · ')}</p>
          <p><b>Dictare:</b> ${ex.dictation.map((d, i) => `${i + 1}. ${esc(d.english)}`).join(' ')}</p>
        </section>`;
    })
    .join('');

  return page(`
    <section class="page cover">
      <p class="brand">Prava</p>
      <h1>Caietul meu de engleză</h1>
      <p class="course">${esc(course.icon ?? '')} ${esc(course.title.romanian)} <span>(${esc(course.title.english)})</span></p>
      <p class="name">Numele meu: <span class="line inline"></span></p>
      <h2>Cum lucrezi cu acest caiet</h2>
      <ol class="how">
        <li>Fă lecția în aplicația Prava.</li>
        <li>Citește cu voce tare lista de cuvinte. Coloana „Se citește” te ajută la pronunție.</li>
        <li>Scrie de mână fiecare cuvânt sau expresie.</li>
        <li>Fă exercițiile. Răspunsurile sunt la sfârșitul caietului: verifică abia după ce termini.</li>
        <li>Dictare: în aplicație, ascultă fiecare propoziție și scrie ce auzi.</li>
      </ol>
      <p class="tip">O lecție pe zi este destul. A doua zi, începe cu ce ai greșit.</p>
      <table class="tracker">
        <thead><tr><th>Lecția</th><th>Data</th><th>Am terminat</th></tr></thead>
        <tbody>${lessons
          .map(
            (lesson, index) =>
              `<tr><td>${index + 1}. ${esc(lesson.icon ?? '')} ${esc(lesson.title.romanian)}</td><td></td><td class="tick">☐</td></tr>`,
          )
          .join('')}</tbody>
      </table>
    </section>
    ${lessonPages}
    <section class="page answers">
      <h2>Răspunsuri</h2>
      ${answers}
    </section>`);
}

function lessonHtml(lesson, number) {
  const ex = exercisesFor(lesson);
  const heading = (section) => `
    <header class="lesson-head">
      <span>Lecția ${number} · ${esc(lesson.icon ?? '')} ${esc(lesson.title.romanian)}</span>
      <span class="en">${esc(lesson.title.english)}</span>
    </header>
    <h2>${section}</h2>`;
  const notes = lesson.items.filter((item) => item.note);

  const wordList = `
    <section class="page">
      ${heading('1. Cuvinte și expresii')}
      <table class="words">
        <thead><tr><th>Engleză</th><th>Se citește</th><th>Română</th></tr></thead>
        <tbody>${lesson.items
          .map(
            (item) => `
          <tr>
            <td class="en">${esc(item.english)}${
              item.forms.length
                ? `<div class="forms">${item.forms.map((form) => esc(form.english)).join(' · ')}</div>`
                : ''
            }</td>
            <td class="say">${esc(item.respelling)}</td>
            <td class="ro">${esc(item.romanian)}</td>
          </tr>`,
          )
          .join('')}</tbody>
      </table>
      ${
        notes.length
          ? `<div class="notes">${notes
              .map((item) => `<p>💡 <b>${esc(item.english)}</b> ${esc(item.note)}</p>`)
              .join('')}</div>`
          : ''
      }
    </section>`;

  // Short words get one line beside them (written twice); phrases get two lines below.
  const shortWords = lesson.items.every((item) => item.english.split(/\s+/).length <= 2);
  const handwriting = `
    <section class="page">
      ${heading('2. Scrie de mână')}
      <p class="instruction">Citește cu voce tare, apoi scrie pe linie. Scrie fiecare de două ori.</p>
      <div class="copy">${lesson.items
        .map((item) =>
          shortWords
            ? `<div class="copy-inline"><span class="model">${esc(item.english)}</span><span class="write"></span></div>`
            : `
        <div class="copy-row">
          <span class="model">${esc(item.english)}</span>
          <span class="line"></span><span class="line"></span>
        </div>`,
        )
        .join('')}</div>
    </section>`;

  const exercises = `
    <section class="page">
      ${heading('3. Exerciții')}
      <h3>A. Unește engleza cu româna</h3>
      <p class="instruction">Scrie litera potrivită lângă fiecare număr.</p>
      <div class="match">
        <ol class="match-left">${ex.match
          .map((m) => `<li><span class="box"></span> ${esc(m.english)}</li>`)
          .join('')}</ol>
        <ul class="match-right">${ex.matchOptions
          .map((o) => `<li><b>${o.letter})</b> ${esc(o.text)}</li>`)
          .join('')}</ul>
      </div>
      ${
        ex.fill.length
          ? `<h3>B. Completează propozițiile</h3>
             <p class="instruction">Alege din cuvintele din chenar.</p>
             <p class="bank">${ex.wordBank.map((word) => `<span>${esc(word)}</span>`).join('')}</p>
             <ol class="fill">${ex.fill.map((f) => `<li>${esc(f.sentence)}</li>`).join('')}</ol>`
          : ''
      }
      <h3>${ex.fill.length ? 'C' : 'B'}. Cum se spune în engleză?</h3>
      <ol class="translate">${ex.translate
        .map((item) => `<li><span class="prompt">${esc(item.romanian)}</span><span class="write"></span></li>`)
        .join('')}</ol>
    </section>`;

  const dictation = `
    <section class="page">
      ${heading('4. Dictare')}
      <p class="instruction">Deschide lecția în aplicație. Ascultă fiecare propoziție (poți apăsa „Mai rar”) și scrie în engleză ce auzi. Sensul în română te ajută să o găsești.</p>
      <ol class="dictation">${ex.dictation
        .map((d) => `<li><span class="hint">${esc(d.romanian)}</span><span class="line"></span></li>`)
        .join('')}</ol>
    </section>`;

  const roleplay = lesson.dialogues.length
    ? `
    <section class="page">
      ${heading('5. Citește cu cineva')}
      <p class="instruction">Cineva din familie este vânzătorul sau casierul, tu ești clientul. Citiți cu voce tare, apoi schimbați rolurile.</p>
      ${lesson.dialogues
        .map(
          (lines, index) => `
        <div class="dialogue">
          <p class="dialogue-title">Dialogul ${index + 1}</p>
          ${lines
            .map(
              (line) => `
            <p class="dl"><span class="who">${line.speaker === 'staff' ? 'Magazinul' : 'Tu'}</span>
              <span class="dl-en">${esc(line.english)}</span>
              <span class="dl-ro">${esc(line.romanian)}</span></p>`,
            )
            .join('')}
        </div>`,
        )
        .join('')}
    </section>`
    : '';

  return wordList + handwriting + exercises + dictation + roleplay;
}

/**
 * The talk-back conversations as scripts to act out with family: one page each,
 * the whole conversation first, then "Scrie tu" (cover the script and write
 * what you would answer).
 */
function conversationsHtml(course) {
  const conversations = course.units.flatMap((unit) => {
    const lesson = unit.lessonId ? getLessonById(unit.lessonId) : undefined;
    const turns = lesson?.activities.filter((activity) => activity.type === 'conversation-turn') ?? [];
    return turns.length ? [{ icon: unit.icon, lesson, turns }] : [];
  });

  const conversationPage = ({ icon, lesson, turns }, number) => {
    const partner = turns[0].partner;
    const partnerLine = (line) => `
      <p class="dl"><span class="who">${esc(partner.nameRomanian)}</span>
        <span class="dl-en">${esc(line.english)}</span>
        <span class="dl-ro">${esc(line.romanian)}</span></p>`;
    const script = turns
      .map((turn) => {
        const respelling = romanianAccentRespellings[turn.response.english] ?? '';
        return `${turn.partnerLines.map(partnerLine).join('')}
          <p class="dl mine"><span class="who">Tu</span>
            <span class="dl-en">${esc(turn.response.english)}</span>
            ${respelling ? `<span class="dl-say">Se citește: ${esc(respelling)}</span>` : ''}
            <span class="dl-ro">${esc(turn.response.romanian)}</span></p>
          ${(turn.closingLines ?? []).map(partnerLine).join('')}`;
      })
      .join('');
    const writeIt = turns
      .map(
        (turn) => `
        <li>
          <span class="heard">${
            turn.partnerLines.length
              ? `${esc(partner.nameRomanian)}: „${esc(turn.partnerLines.map((line) => line.english).join(' '))}”`
              : 'Tu începi.'
          }</span>
          <span class="hint">${esc(turn.taskRomanian)}</span>
          <span class="line"></span>
        </li>`,
      )
      .join('');

    const head = `
        <header class="lesson-head">
          <span>Conversația ${number} · ${esc(icon ?? '')} ${esc(lesson.title.romanian)}</span>
          <span class="en">${esc(lesson.title.english)}</span>
        </header>`;
    // The answers to "Scrie tu" are on the page before, so she cannot peek.
    return `
      <section class="page">
        ${head}
        <h2>Citește cu cineva</h2>
        <p class="instruction">${esc(turns[0].instructionRomanian ?? '')}</p>
        <div class="dialogue">${script}</div>
      </section>
      <section class="page">
        ${head}
        <h2>Scrie tu</h2>
        <p class="instruction">Fără să te uiți pe pagina dinainte: ce răspunzi? Scrie în engleză, apoi verifică în dialog.</p>
        <ol class="write-answers">${writeIt}</ol>
      </section>`;
  };

  return page(`
    <section class="page cover">
      <p class="brand">Prava</p>
      <h1>Conversații de citit cu cineva</h1>
      <p class="course">${esc(course.icon ?? '')} ${esc(course.title.romanian)} <span>(${esc(course.title.english)})</span></p>
      <h2>Cum lucrați</h2>
      <ol class="how">
        <li>Fă conversația în aplicația Prava.</li>
        <li>Cineva din familie citește ce spune celălalt (vânzătorul, vecina, curierul…). Tu citești rândurile „Tu”, cu voce tare. „Se citește” te ajută la pronunție.</li>
        <li>Schimbați rolurile, apoi jucați scena din nou, mai repede.</li>
        <li>Întoarce pagina: la „Scrie tu” scrie ce ai răspunde, fără să te uiți. Verifică apoi în dialog.</li>
      </ol>
      <p class="tip">Jucați scena în picioare, ca în magazin sau la ușă. Așa o ții minte mai ușor.</p>
      <table class="tracker">
        <thead><tr><th>Conversația</th><th>Data</th><th>Am jucat-o</th></tr></thead>
        <tbody>${conversations
          .map(
            ({ icon, lesson }, index) =>
              `<tr><td>${index + 1}. ${esc(icon ?? '')} ${esc(lesson.title.romanian)}</td><td></td><td class="tick">☐</td></tr>`,
          )
          .join('')}</tbody>
      </table>
    </section>
    ${conversations.map((conversation, index) => conversationPage(conversation, index + 1)).join('')}`);
}

function pocketCardHtml() {
  const help = [
    'Sorry?',
    'Can you repeat that, please?',
    'Slowly, please.',
    'I speak a little English.',
    'Can you write it down, please?',
    'Thank you very much.',
  ];
  const checkout = [
    ['Did you find everything okay?', 'Yes, thank you.', 'Ați găsit tot ce căutați?'],
    ['Do you need a bag?', 'No, thank you.', 'Aveți nevoie de o pungă?'],
    ['Do you have a points card?', "No, I don't.", 'Aveți card de puncte?'],
    ['Debit or credit?', 'Debit, please.', 'Debit sau credit?'],
    ['Have a good day!', 'Thanks, you too!', 'O zi bună!'],
  ];
  const front = `
    <div class="panel">
      <p class="panel-title">🙋 Când nu înțeleg</p>
      ${help
        .map(
          (english) =>
            `<p class="pc-row"><b>${esc(english)}</b><span class="say">${esc(romanianAccentRespellings[english] ?? '')}</span></p>`,
        )
        .join('')}
    </div>`;
  const back = `
    <div class="panel">
      <p class="panel-title">🧾 La casă</p>
      ${checkout
        .map(
          ([question, answer, meaning]) =>
            `<p class="pc-row"><b>${esc(question)}</b> <span class="ro">(${esc(meaning)})</span><span class="answer">→ ${esc(answer)}</span></p>`,
        )
        .join('')}
    </div>`;
  const card = `<div class="card">${front}<div class="fold"></div>${back}</div>`;

  return page(
    `
    <section class="page card-page">
      <h2>Card de buzunar</h2>
      <p class="instruction">Decupează pe linia punctată, îndoaie la mijloc și lipește cu bandă (sau plastifică).
      Ține-l în portofel sau în geantă. Sunt două carduri: unul pentru tine, unul de rezervă.</p>
      ${card}${card}
    </section>`,
    'card',
  );
}

function houseLabelsHtml(homeLessons) {
  const seen = new Set();
  const items = homeLessons
    .flatMap((lesson) => lesson.items)
    .filter((item) => {
      const key = item.english.toLowerCase();
      if (NOT_LABELS.has(key) || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  const perSheet = 30;
  const sheets = [];
  for (let start = 0; start < items.length; start += perSheet) {
    sheets.push(items.slice(start, start + perSheet));
  }

  return page(
    sheets
      .map(
        (sheet) => `
      <section class="labels-sheet">${sheet
        .map(
          (item) => `
        <div class="label">
          <span class="label-en">${esc(item.english)}</span>
          <span class="label-sub"><span class="say">${esc(item.respelling)}</span> · ${esc(item.romanian)}</span>
        </div>`,
        )
        .join('')}</section>`,
      )
      .join(''),
    'labels',
  );
}

// ---------------------------------------------------------------- output

function page(body, kind = 'workbook') {
  return `<!doctype html>
<html lang="ro"><head><meta charset="utf-8"><title>Prava</title><style>${css(kind)}</style></head>
<body class="kind-${kind}">${body}</body></html>`;
}

function css(kind) {
  const base = `
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; color: #1A2420; font-size: 13pt; line-height: 1.35; }
    .say { color: #9C5226; font-style: italic; }
    .ro { color: #56625C; }
    b { font-weight: 700; }`;
  if (kind === 'labels') {
    // Avery 5160 / 8160: 30 labels (2 5/8" x 1"), 3 across, 10 down.
    return `${base}
      @page { size: letter; margin: 0; }
      .labels-sheet { width: 8.5in; height: 11in; padding: 0.5in 0 0 0.1875in; display: grid;
        grid-template-columns: repeat(3, 2.625in); grid-auto-rows: 1in; column-gap: 0.125in;
        break-after: page; }
      .labels-sheet:last-child { break-after: auto; }
      .label { display: flex; flex-direction: column; justify-content: center; padding: 0 0.15in; overflow: hidden; }
      .label-en { font-size: 17pt; font-weight: 800; line-height: 1.1; }
      .label-sub { font-size: 9.5pt; color: #56625C; margin-top: 2px; }`;
  }
  if (kind === 'card') {
    return `${base}
      @page { size: letter; margin: 0.6in; }
      h2 { color: #1E5A45; margin: 0 0 4px; }
      .instruction { font-size: 11pt; color: #56625C; margin: 0 0 18px; }
      .card { display: flex; border: 1.5px dashed #888; width: fit-content; margin-bottom: 26px; }
      .panel { width: 4in; height: 2.7in; padding: 0.13in 0.16in; }
      .fold { border-left: 1px dotted #aaa; }
      .panel-title { margin: 0 0 5px; font-size: 12pt; font-weight: 800; color: #1E5A45; }
      .pc-row { margin: 0 0 4px; font-size: 10.5pt; line-height: 1.2; }
      .pc-row .say, .pc-row .answer { display: block; }
      .pc-row .answer { color: #22683F; font-weight: 700; }
      .pc-row .ro { font-size: 8.5pt; }`;
  }
  return `${base}
    @page { size: letter; margin: 0.6in 0.7in; }
    .page { break-after: page; }
    .page:last-child { break-after: auto; }
    h1 { font-size: 30pt; margin: 6px 0 4px; color: #1E5A45; }
    h2 { font-size: 18pt; margin: 6px 0 10px; color: #1E5A45; }
    h3 { font-size: 14pt; margin: 18px 0 4px; }
    .brand { font-size: 13pt; font-weight: 800; letter-spacing: 2px; color: #9C5226; margin: 0; text-transform: uppercase; }
    .course { font-size: 17pt; font-weight: 700; margin: 0 0 22px; }
    .course span { color: #56625C; font-weight: 400; }
    .name { margin: 0 0 22px; }
    .how li { margin-bottom: 6px; }
    .tip { background: #F8E9DC; padding: 10px 14px; border-radius: 8px; }
    .tracker { width: 100%; border-collapse: collapse; margin-top: 18px; }
    .tracker th, .tracker td { border: 1px solid #B9AE9C; padding: 7px 10px; text-align: left; }
    .tracker td:nth-child(2) { width: 1.6in; }
    .tick { width: 1.2in; text-align: center !important; font-size: 16pt; }
    .lesson-head { display: flex; justify-content: space-between; font-size: 10.5pt; color: #56625C;
      border-bottom: 2px solid #1E5A45; padding-bottom: 3px; margin-bottom: 6px; }
    .lesson-head .en { font-style: italic; }
    .instruction { color: #56625C; margin: 0 0 10px; }
    .words { width: 100%; border-collapse: collapse; }
    .words th { text-align: left; font-size: 10.5pt; text-transform: uppercase; color: #56625C; border-bottom: 1px solid #B9AE9C; padding: 4px 6px; }
    .words td { border-bottom: 1px solid #E3DACB; padding: 6px; vertical-align: top; }
    .words td.en { font-weight: 800; font-size: 14pt; width: 40%; }
    .words td.say { width: 30%; }
    .forms { font-weight: 400; font-size: 10.5pt; color: #56625C; }
    .notes { margin-top: 12px; font-size: 11pt; }
    .notes p { margin: 0 0 5px; }
    .line { display: block; border-bottom: 1px solid #8A8F8C; height: 0.36in; }
    .line.inline { display: inline-block; width: 3.5in; height: auto; }
    .copy-row { margin-bottom: 6px; break-inside: avoid; }
    .copy-row .model { font-size: 14pt; font-weight: 700; color: #6F7A74; }
    .copy-inline { display: flex; align-items: flex-end; gap: 12px; margin-bottom: 4px; break-inside: avoid; }
    .copy-inline .model { width: 2.1in; font-size: 15pt; font-weight: 700; color: #6F7A74; }
    .copy-inline .write { flex: 1; height: 0.5in; border-bottom: 1px solid #8A8F8C; }
    .match { display: flex; gap: 0.5in; }
    .match-left { margin: 0; padding-left: 1.4em; }
    .match-left li, .match-right li { margin-bottom: 9px; }
    .match-right { list-style: none; margin: 0; padding: 0; }
    .box { display: inline-block; width: 0.32in; height: 0.28in; border: 1px solid #8A8F8C; vertical-align: middle; margin-right: 6px; }
    .bank span { display: inline-block; border: 1.5px solid #1E5A45; border-radius: 6px; padding: 2px 10px; margin: 0 8px 6px 0; font-weight: 700; }
    .fill li { margin-bottom: 12px; font-size: 14pt; }
    .dictation li { margin-bottom: 10px; break-inside: avoid; }
    .translate li { margin-bottom: 4px; break-inside: avoid; }
    .translate li > span { display: inline-block; vertical-align: bottom; }
    .translate .prompt { width: 2.9in; }
    .translate .write { width: 3.6in; height: 0.4in; border-bottom: 1px solid #8A8F8C; }
    .prompt, .hint { color: #56625C; }
    .dialogue { border: 1px solid #E3DACB; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; break-inside: avoid; }
    .dialogue-title { margin: 0 0 4px; font-weight: 800; color: #1E5A45; }
    .dl { margin: 0 0 6px; }
    .who { display: inline-block; min-width: 1.05in; font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #9C5226; }
    .dl-en { font-weight: 700; }
    .dl-ro { display: block; margin-left: 1.05in; font-size: 11pt; color: #56625C; }
    .dl.mine .who { color: #1E5A45; }
    .dl.mine .dl-en { font-size: 13.5pt; }
    .dl-say { display: block; margin-left: 1.05in; font-size: 11.5pt; font-weight: 700; color: #9C5226; }
    .write-answers li { margin-bottom: 16px; break-inside: avoid; }
    .write-answers .line { height: 0.45in; }
    .write-answers .heard, .write-answers .hint { display: block; }
    .write-answers .heard { font-weight: 700; }
    .write-answers .hint { font-size: 11pt; }
    .answers h3 { margin-top: 12px; }
    .answers p { margin: 0 0 4px; font-size: 11pt; }`;
}

async function printPdf(fileName, html) {
  const htmlPath = join(htmlDirectory, fileName.replace(/\.pdf$/, '.html'));
  const pdfPath = join(outputDirectory, fileName);
  await writeFile(htmlPath, html, 'utf8');
  await rm(pdfPath, { force: true });
  // Tries each installed browser in turn: one that is in the middle of an
  // update can quit without printing anything.
  const problems = [];
  for (const [index, browser] of browsers.entries()) {
    const result = spawnSync(
      browser,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-pdf-header-footer',
        // Its own profile, so an open browser window cannot take the job over.
        `--user-data-dir=${join(projectRoot, '.tools', `print-profile-${index}`)}`,
        `--print-to-pdf=${pdfPath}`,
        pathToFileURL(htmlPath).href,
      ],
      { encoding: 'utf8', windowsHide: true, timeout: 120000 },
    );
    if (existsSync(pdfPath)) {
      console.log(`  ${fileName}`);
      return;
    }
    problems.push(`${browser}: ${result.error ?? (result.stderr.trim() || `exit code ${result.status}`)}`);
  }
  throw new Error(`Could not print ${fileName}:\n  ${problems.join('\n  ')}`);
}

function findBrowsers() {
  const candidates =
    process.platform === 'win32'
      ? [
          'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
          'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        ]
      : process.platform === 'darwin'
        ? [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
          ]
        : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/microsoft-edge'];
  const found = candidates.filter((candidate) => existsSync(candidate));
  if (found.length === 0) {
    throw new Error('Microsoft Edge or Google Chrome is needed to make the PDFs.');
  }
  return found;
}

function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
