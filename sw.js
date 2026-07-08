const CACHE = 'delivery-order-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/success.html'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // Network-first: always try the network for fresh content,
  // fall back to cache only if offline.
  e.respondWith(
    fetch(e.request).then(function(response) {
      var copy = response.clone();
      caches.open(CACHE).then(function(cache) {
        cache.put(e.request, copy);
      });
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
