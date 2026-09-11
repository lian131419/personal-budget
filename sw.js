var CACHE_NAME = 'budget-v5';
var BASE = new URL('./', self.location).pathname;
var URLS = [BASE, BASE + 'index.html', BASE + 'manifest.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    return Promise.all(URLS.map(function (u) {
      return cache.add(u).catch(function () { });
    }));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (resp) {
      if (resp && resp.ok) {
        var copy = resp.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(e.request, copy); });
      }
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (r) {
        return r || caches.match(BASE + 'index.html');
      });
    })
  );
});
