import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { generatedEnglishAudioSources } from '../src/data/audio/english-audio-catalog.ts';
import { romanianAccentRespellings } from '../src/data/audio/romanian-accent-respellings.ts';

const respellings = Object.entries(romanianAccentRespellings);

test('every English lesson recording has a Romanian-accent spelling', () => {
  const missing = generatedEnglishAudioSources
    .map((source) => source.text)
    .filter((text) => !Object.hasOwn(romanianAccentRespellings, text));

  assert.deepEqual([...new Set(missing)], []);
});

test('every Romanian-accent spelling belongs to a lesson recording', () => {
  const lessonTexts = new Set(generatedEnglishAudioSources.map((source) => source.text));

  assert.deepEqual(
    respellings.map(([english]) => english).filter((english) => !lessonTexts.has(english)),
    [],
  );
});

test('spellings use Romanian letters only', () => {
  for (const [english, respelling] of respellings) {
    // Comma-below ș/ț, never the look-alike cedilla ş/ţ.
    assert.doesNotMatch(respelling, /[şţŞŢ]/, `cedilla in "${respelling}" (${english})`);
    // Letters a Romanian reader would not say the English way.
    assert.doesNotMatch(respelling, /[wyqkx]|th/i, `English spelling in "${respelling}" (${english})`);
    assert.match(respelling, /^[A-Za-zĂÂÎȘȚăâîșț ,.?!]+$/, `unexpected character in "${respelling}"`);
  }
});

test('sentences keep their capital letter and closing punctuation', () => {
  const sentences = respellings.filter(([english]) => /[.?!]$/.test(english));
  assert.ok(sentences.length > 50);
  for (const [english, respelling] of sentences) {
    assert.match(respelling, /^[A-ZĂÂÎȘȚ]/, `capital letter: "${respelling}"`);
    assert.equal(respelling.at(-1), english.at(-1), `punctuation: "${respelling}"`);
  }
});

test('accent phrases of three or more words can be played word by word, each word timed', async () => {
  // The asset map loads MP3s with require(), so it is read as text here.
  const assetMapPath = new URL('../src/data/audio/accent-audio-assets.ts', import.meta.url);
  // Windows checkouts may have CRLF line endings.
  const assetMap = (await readFile(assetMapPath, 'utf8')).replaceAll('\r\n', '\n');
  const entries = [...assetMap.matchAll(/^ {2}'([a-z0-9-]+)': \{\n([\s\S]*?)\n {2}\},$/gm)];
  assert.ok(entries.length >= generatedEnglishAudioSources.length);

  let wordByWord = 0;
  for (const [, key, body] of entries) {
    const respelling = JSON.parse(body.match(/respelling: (".*"),/)[1]);
    const spaced = body.match(
      /spaced: \{\n {6}asset: require\('(.+)'\),\n {6}words: (.+),\n {6}starts: (.+),\n {4}\},/,
    );
    if (respelling.split(' ').length < 3) {
      assert.equal(spaced, null, `${key} is too short for word by word`);
      continue;
    }
    assert.ok(spaced, `${key} ("${respelling}") has a word-by-word recording`);
    wordByWord += 1;
    const [, assetPath, wordsJson, startsJson] = spaced;
    const words = JSON.parse(wordsJson);
    const starts = JSON.parse(startsJson);
    // The words on screen are exactly the "Se citește" spelling.
    assert.equal(words.join(' '), respelling);
    assert.equal(starts.length, words.length);
    starts.forEach((start, index) => {
      assert.ok(index === 0 || start - starts[index - 1] > 0.7, `${key}: word ${index} timing`);
    });
    assert.ok(existsSync(new URL(assetPath, assetMapPath)), `${key}: ${assetPath} exists`);
  }
  assert.ok(wordByWord > 150);
});
