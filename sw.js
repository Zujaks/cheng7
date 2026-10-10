/* Cheng 7 — 오프라인 캐시 */
const CACHE = 'cheng7-v7';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './tex-svg.js', './forest.jpg',
  './bg-night.jpg', './bg-sea.jpg', './bg-sunset.jpg', './bg-mist.jpg',
  './icon-192.png', './icon-512.png', './icon-1024.png', './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 캐시 우선 — 없으면 네트워크, 받아오면 캐시에 넣는다 */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
