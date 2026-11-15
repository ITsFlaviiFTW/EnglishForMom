// Builds the installable web app (PWA) into dist/.
//   npm run build:web
// 1. Exports the Expo Router app as static pages.
// 2. Fills in the service worker's build id and the list of files to keep offline.
import { spawnSync } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const expoCli = join(root, 'node_modules', 'expo', 'bin', 'cli');
const exportResult = spawnSync(
  process.execPath,
  [expoCli, 'export', '--platform', 'web', '--output-dir', 'dist', '--clear'],
  { cwd: root, stdio: 'inherit' },
);
if (exportResult.status !== 0) {
  process.exit(exportResult.status ?? 1);
}

const files = (await walk(dist)).map((file) => relative(dist, file).split('\\').join('/'));

const pageUrls = ['/', '/lessons', '/progress', '/review', '/lessons/[lessonId]'];
const scriptUrls = files
  .filter((file) => file.startsWith('_expo/static/') && !file.endsWith('.map'))
  .map((file) => `/${file}`);
const shellUrls = ['/manifest.webmanifest', '/icons/apple-touch-icon.png', '/icons/icon-192.png'];
const precacheUrls = [...pageUrls, ...scriptUrls, ...shellUrls];

for (const required of ['sw.js', 'manifest.webmanifest', 'icons/apple-touch-icon.png']) {
  if (!files.includes(required)) {
    throw new Error(`dist/${required} is missing; is the public/ folder being exported?`);
  }
}

const buildId = `${gitRevision()}-${Date.now().toString(36)}`;
const serviceWorkerPath = join(dist, 'sw.js');
const serviceWorker = (await readFile(serviceWorkerPath, 'utf8'))
  .replace("'__PRAVA_BUILD_ID__'", JSON.stringify(buildId))
  .replace('__PRAVA_PRECACHE_URLS__', JSON.stringify(precacheUrls));
if (serviceWorker.includes('__PRAVA_')) {
  throw new Error('Service worker placeholders were not replaced.');
}
await writeFile(serviceWorkerPath, serviceWorker);
await writeFile(join(dist, 'version.json'), `${JSON.stringify({ buildId }, null, 2)}\n`);

console.log(`\nPrava web build ${buildId}: ${files.length} files, ${precacheUrls.length} kept offline.`);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return nested.flat();
}

function gitRevision() {
  const revision = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' });
  const status = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  const base = revision.status === 0 ? revision.stdout.trim() : 'nogit';
  return status.stdout?.trim() ? `${base}-dirty` : base;
}
