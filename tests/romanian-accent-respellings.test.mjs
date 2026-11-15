import assert from 'node:assert/strict';
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
