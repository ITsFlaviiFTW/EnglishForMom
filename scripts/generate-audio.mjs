import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { generatedEnglishAudioSources } from '../src/data/audio/english-audio-catalog.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toolsDirectory = join(projectRoot, '.tools');
const virtualEnvironment = join(toolsDirectory, 'piper-venv');
const voicesDirectory = join(toolsDirectory, 'piper-voices');
const audioDirectory = join(projectRoot, 'assets', 'audio', 'en-US');
const assetMapPath = join(projectRoot, 'src', 'data', 'audio', 'generated-audio-assets.ts');
const modelName = 'en_US-ljspeech-medium';
const modelPath = join(voicesDirectory, `${modelName}.onnx`);
const configPath = `${modelPath}.json`;
const voiceBaseUrl =
  'https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/medium';
const expectedModelSha256 = '6f52a751e2349abe7a76735eb09dc1875298c77ea2342ffd2fef79ff81b87f22';
const piperVersion = '1.7.0';
const force = process.argv.includes('--force');

main().catch((error) => {
  console.error(`\nAudio generation failed: ${error.message}`);
  process.exitCode = 1;
});

async function main() {
  validateSources();
  await Promise.all([
    mkdir(toolsDirectory, { recursive: true }),
    mkdir(voicesDirectory, { recursive: true }),
    mkdir(audioDirectory, { recursive: true }),
  ]);

  const systemPython = findPython();
  const environmentPython = getEnvironmentPython();

  if (!(await exists(environmentPython))) {
    console.log('Preparing the local voice generator (first run only)...');
    run(systemPython.command, [...systemPython.prefix, '-m', 'venv', virtualEnvironment]);
  }

  if (!canImportPiper(environmentPython)) {
    console.log(`Installing Piper ${piperVersion} locally (first run only)...`);
    run(environmentPython, ['-m', 'pip', 'install', `piper-tts==${piperVersion}`]);
  }

  await downloadIfMissing(`${voiceBaseUrl}/${modelName}.onnx?download=true`, modelPath);
  await verifySha256(modelPath, expectedModelSha256);
  await downloadIfMissing(`${voiceBaseUrl}/${modelName}.onnx.json?download=true`, configPath);

  let generatedCount = 0;
  for (const source of generatedEnglishAudioSources) {
    const outputPath = join(audioDirectory, `${source.key}.wav`);
    if (!force && (await exists(outputPath))) {
      console.log(`Keeping ${source.key}.wav`);
      continue;
    }

    const temporaryPath = `${outputPath}.partial.wav`;
    await rm(temporaryPath, { force: true });
    console.log(`Creating ${source.key}.wav — ${source.text}`);
    run(environmentPython, [
      '-m',
      'piper',
      '--model',
      modelPath,
      '--config',
      configPath,
      '--output-file',
      temporaryPath,
      '--length-scale',
      '1.12',
      '--',
      source.text,
    ]);
    await rename(temporaryPath, outputPath);
    generatedCount += 1;
  }

  await writeAssetMap();
  console.log(
    `\nDone. ${generatedCount} recording${generatedCount === 1 ? '' : 's'} created; ` +
      `${generatedEnglishAudioSources.length} available to the app.`,
  );
  console.log('The recordings are a little slower to make beginner listening easier.');
}

function validateSources() {
  const keys = new Set();
  for (const source of generatedEnglishAudioSources) {
    if (!/^[a-z0-9-]+$/.test(source.key)) {
      throw new Error(`Unsafe audio key: ${source.key}`);
    }
    if (keys.has(source.key)) {
      throw new Error(`Duplicate audio key: ${source.key}`);
    }
    keys.add(source.key);
  }
}

function findPython() {
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
      encoding: 'utf8',
      windowsHide: true,
    });
    if (result.status === 0) {
      return candidate;
    }
  }

  throw new Error('Python 3 was not found. Install Python 3, then run this command again.');
}

function getEnvironmentPython() {
  return process.platform === 'win32'
    ? join(virtualEnvironment, 'Scripts', 'python.exe')
    : join(virtualEnvironment, 'bin', 'python');
}

function canImportPiper(python) {
  const result = spawnSync(python, ['-c', 'import piper'], {
    encoding: 'utf8',
    windowsHide: true,
  });
  return result.status === 0;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
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

async function downloadIfMissing(url, destination) {
  if (await exists(destination)) {
    return;
  }

  console.log(`Downloading ${destination.endsWith('.json') ? 'voice settings' : 'the English voice'}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download returned HTTP ${response.status}.`);
  }

  const temporaryPath = `${destination}.download`;
  await rm(temporaryPath, { force: true });
  await writeFile(temporaryPath, Buffer.from(await response.arrayBuffer()));
  await rename(temporaryPath, destination);
}

async function verifySha256(path, expected) {
  const hash = createHash('sha256');
  const stream = createReadStream(path);
  for await (const chunk of stream) {
    hash.update(chunk);
  }

  const actual = hash.digest('hex');
  if (actual !== expected) {
    await rm(path, { force: true });
    throw new Error('The downloaded voice did not pass its integrity check. Please run the command again.');
  }
}

async function writeAssetMap() {
  const entries = generatedEnglishAudioSources.map((source) => {
    const audioPath = join(audioDirectory, `${source.key}.wav`);
    const importPath = relative(dirname(assetMapPath), audioPath).replaceAll('\\', '/');
    return `  '${source.key}': require('${importPath}'),`;
  });

  const contents = [
    '// Generated by `npm run generate-audio`. Do not edit this file manually.',
    'export const generatedAudioAssets: Readonly<Record<string, number>> = {',
    ...entries,
    '};',
    '',
  ].join('\n');

  await writeFile(assetMapPath, contents, 'utf8');
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}
