// Shared by the audio generator scripts:
// - Azure text-to-speech, cached in .tools/speech-cache so a phrase is only
//   ever sent once (only new or changed text costs anything);
// - joining recordings and pauses into MP3 files (scripts/join_audio.py).
//
// Needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION, either as environment
// variables or in .env.local (git-ignored). The key is only sent to Azure; it is
// never printed and never written into the app.
import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Natural US English voice for every English recording. */
export const ENGLISH_VOICE = 'en-US-AvaNeural';
/** Romanian voice for the "Cu accent românesc" readings. */
export const ROMANIAN_VOICE = 'ro-RO-AlinaNeural';
/** Canadian voices for store staff in the real-speed dialogues. */
export const STAFF_VOICES = { female: 'en-CA-ClaraNeural', male: 'en-CA-LiamNeural' };
/** A little slower than normal, for a beginner (lesson words and phrases). */
const LESSON_RATE = '-10%';
/** Normal speaking speed, as heard in a store (dialogues). */
export const NATURAL_RATE = '+0%';
// One sample rate for everything, so any recordings can be joined.
const OUTPUT_FORMAT = 'riff-22050hz-16bit-mono-pcm';
// The free (F0) tier allows 20 requests a minute.
const REQUEST_SPACING_MS = 3200;

const toolsDirectory = join(projectRoot, '.tools');
const cacheDirectory = join(toolsDirectory, 'speech-cache');
const venvDirectory = join(toolsDirectory, 'audio-venv');

/** Where the cached recording of `text` read by `voice` at `rate` lives. */
export function speechPath(voice, text, rate = LESSON_RATE) {
  const hash = createHash('sha256')
    .update(`${voice}|${rate}|${OUTPUT_FORMAT}|${text}`)
    .digest('hex');
  return join(cacheDirectory, `${hash.slice(0, 20)}.wav`);
}

/** Makes sure every `{ voice, text, rate? }` is recorded; asks Azure only for new ones. */
export async function ensureSpeech(requests) {
  const unique = new Map(
    requests.map((request) => [speechPath(request.voice, request.text, request.rate), request]),
  );
  const missing = [...unique].filter(([path]) => !existsSync(path));
  if (missing.length === 0) {
    return;
  }

  const azure = await loadAzureSettings();
  await mkdir(cacheDirectory, { recursive: true });
  const minutes = Math.ceil((missing.length * REQUEST_SPACING_MS) / 60000);
  console.log(`Recording ${missing.length} new phrases with Azure (about ${minutes} min)...`);
  for (const [index, [path, { voice, text, rate = LESSON_RATE }]] of missing.entries()) {
    if (index > 0) {
      await sleep(REQUEST_SPACING_MS);
    }
    const audio = await synthesize(azure, voice, text, rate);
    await writeFile(`${path}.partial`, audio);
    await rename(`${path}.partial`, path);
    console.log(`  ${index + 1}/${missing.length}  ${text}`);
  }
}

/** Groups lesson audio sources by text: one recording per distinct phrase. */
export function groupByText(sources, outputDirectory) {
  const phrases = new Map();
  for (const source of sources) {
    if (!/^[a-z0-9-]+$/.test(source.key)) {
      throw new Error(`Unsafe audio key: ${source.key}`);
    }
    let phrase = phrases.get(source.text);
    if (!phrase) {
      phrase = { text: source.text, output: join(outputDirectory, `${source.key}.mp3`), keys: [] };
      phrases.set(source.text, phrase);
    }
    phrase.keys.push(source.key);
  }
  return [...phrases.values()];
}

/**
 * Builds MP3 files from parts: `{ wav }` (a cached recording, silence trimmed)
 * or `{ silence: seconds }`. Returns, per output path, the second at which
 * each recording starts.
 */
export async function joinAudio(items) {
  const python = ensurePython();
  const jobPath = join(toolsDirectory, 'join-job.json');
  const resultPath = join(toolsDirectory, 'join-result.json');
  await writeFile(jobPath, JSON.stringify({ bitrate: 48, items }));
  run(python, [join(projectRoot, 'scripts', 'join_audio.py'), jobPath, resultPath]);
  const results = JSON.parse(await readFile(resultPath, 'utf8'));
  await rm(jobPath, { force: true });
  await rm(resultPath, { force: true });
  return results;
}

/** Deletes the files in `directory` (not folders) that are not in `keep`. */
export async function removeStaleFiles(directory, keep) {
  const kept = new Set(keep);
  for (const name of await readdir(directory)) {
    const path = join(directory, name);
    if (!kept.has(path) && (await stat(path)).isFile()) {
      await rm(path);
    }
  }
}

async function loadAzureSettings() {
  const fromFile = {};
  const envFile = join(projectRoot, '.env.local');
  if (existsSync(envFile)) {
    const text = (await readFile(envFile, 'utf8')).replace(/^﻿/, '');
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (match) {
        fromFile[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
  const key = process.env.AZURE_SPEECH_KEY || fromFile.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION || fromFile.AZURE_SPEECH_REGION;
  if (!key || !region) {
    throw new Error('Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env.local.');
  }
  if (!/^[a-z0-9]+$/.test(region)) {
    throw new Error('AZURE_SPEECH_REGION should look like "eastus".');
  }
  return { key, region };
}

async function synthesize({ key, region }, voice, text, rate) {
  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voice.slice(0, 5)}">` +
    `<voice name="${voice}"><prosody rate="${rate}">${escapeXml(text)}</prosody></voice>` +
    '</speak>';
  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': OUTPUT_FORMAT,
        'User-Agent': 'prava-audio-generator',
      },
      body: ssml,
    });
    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt >= 5) {
      throw new Error(`Azure answered ${response.status} for "${text}".`);
    }
    const waitSeconds = Number(response.headers.get('retry-after')) || 10 * attempt;
    console.log(`  Azure is busy (${response.status}), waiting ${waitSeconds}s...`);
    await sleep(waitSeconds * 1000);
  }
}

/** Python with the MP3 encoder, in .tools/audio-venv (set up on first use). */
function ensurePython() {
  const python =
    process.platform === 'win32'
      ? join(venvDirectory, 'Scripts', 'python.exe')
      : join(venvDirectory, 'bin', 'python');
  if (!existsSync(python)) {
    console.log('Preparing the MP3 encoder (first run only)...');
    const system = findSystemPython();
    run(system.command, [...system.prefix, '-m', 'venv', venvDirectory]);
  }
  if (spawnSync(python, ['-c', 'import lameenc'], { windowsHide: true }).status !== 0) {
    run(python, ['-m', 'pip', 'install', '--quiet', 'lameenc']);
  }
  return python;
}

function findSystemPython() {
  const candidates =
    process.platform === 'win32'
      ? [
          { command: 'py', prefix: ['-3'] },
          { command: 'python', prefix: [] },
        ]
      : [
          { command: 'python3', prefix: [] },
          { command: 'python', prefix: [] },
        ];
  for (const candidate of candidates) {
    const result = spawnSync(candidate.command, [...candidate.prefix, '--version'], {
      windowsHide: true,
    });
    if (result.status === 0) {
      return candidate;
    }
  }
  throw new Error('Python 3 was not found. Install Python 3, then run this command again.');
}

function escapeXml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function sleep(milliseconds) {
  return new Promise((done) => setTimeout(done, milliseconds));
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    stdio: 'inherit',
    windowsHide: true,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} exited with code ${result.status}.`);
  }
}
