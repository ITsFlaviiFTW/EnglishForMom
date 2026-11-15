/* Prava offline cache.
 *
 * - Pages: network first, so updates show up right away; the cached copy is
 *   used when there is no connection.
 * - Scripts, icons and audio: their file names change whenever their content
 *   changes, so a cached copy is always correct (cache first).
 * - Audio: iPhone Safari asks for byte ranges, so cached audio is answered
 *   with the requested slice (HTTP 206).
 *
 * scripts/build-web.mjs replaces the two placeholders below at build time.
 */
const BUILD_ID = '__PRAVA_BUILD_ID__';
const PRECACHE_URLS = __PRAVA_PRECACHE_URLS__;

const PAGES_CACHE = `prava-pages-${BUILD_ID}`;
const ASSETS_CACHE = 'prava-assets-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('prava-pages-') && key !== PAGES_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request, url));
    return;
  }

  if (/\.(wav|mp3|m4a)$/i.test(url.pathname)) {
    event.respondWith(cachedAudio(request, url));
    return;
  }

  if (
    url.pathname.startsWith('/_expo/static/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirstPage(request, url) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached =
      (await cache.match(request, { ignoreSearch: true })) ||
      (url.pathname.startsWith('/lessons/') && url.pathname !== '/lessons/'
        ? await cache.match('/lessons/[lessonId]')
        : undefined) ||
      (await cache.match('/'));
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  // Looks in every Prava cache, including files precached at install time.
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  const cache = await caches.open(ASSETS_CACHE);
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function cachedAudio(request, url) {
  const cache = await caches.open(ASSETS_CACHE);
  const key = url.href;
  let response = await cache.match(key);

  if (!response) {
    try {
      // Fetch the whole file once (no Range header), keep it, then serve slices.
      const full = await fetch(key, { credentials: 'same-origin' });
      if (!full.ok || full.status !== 200) {
        return fetch(request);
      }
      await cache.put(key, full.clone());
      response = full;
    } catch {
      return fetch(request);
    }
  }

  const range = request.headers.get('range');
  if (!range) {
    return response;
  }
  return sliceForRange(response, range);
}

async function sliceForRange(response, rangeHeader) {
  const buffer = await response.arrayBuffer();
  const size = buffer.byteLength;
  const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  let start = 0;
  let end = size - 1;

  if (match) {
    if (match[1] === '' && match[2] !== '') {
      start = Math.max(size - Number(match[2]), 0);
    } else {
      start = match[1] === '' ? 0 : Number(match[1]);
      end = match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1);
    }
  }

  if (start >= size || start > end) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${size}` },
    });
  }

  const chunk = buffer.slice(start, end + 1);
  return new Response(chunk, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'audio/wav',
      'Content-Length': String(chunk.byteLength),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
    },
  });
}
