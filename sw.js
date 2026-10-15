const CACHE_NAME = 'finance-kita-v11';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './INDEX.HTML',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
        } catch (e) {
          // Abaikan jika salah satu varian nama file (index.html vs INDEX.HTML) tidak ditemukan di server tertentu
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && !event.request.url.includes('script.google.com')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(event.request, networkResponse.clone());
            } catch (err) { }
            return networkResponse;
          });
        }).catch(() => caches.match('./INDEX.HTML') || caches.match('./index.html'));
      })
    );
  }
});
