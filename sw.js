/* Service worker: gjør at Treningsbok kan installeres og virker uten nett.
 * Appens egne filer hentes fra nettet først (så oppdateringer kommer med en gang),
 * og den lagrede kopien brukes bare når du er frakoblet. */
var CACHE = 'treningsbok-v11';
var CORE = ['./', 'index.html', 'style.css', 'app.js', 'anim-ovelser.js', 'anim.js', 'mer.js', 'ovelser-data.js', 'ovelser.js', 'firebase-config.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-64.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
function keep(req, res) {
  if (res && (res.ok || res.type === 'opaque')) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
  return res;
}
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var same = url.origin === self.location.origin;
  var fonts = /^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  var firebaseLib = url.hostname === 'www.gstatic.com' && url.pathname.indexOf('/firebasejs/') === 0;
  if (!same && !fonts && !firebaseLib) return;                 // innlogging og databasen går rett til nettet
  if (same) {
    e.respondWith(fetch(req).then(function (res) { return keep(req, res); }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (r) {
        return r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error());
      });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function (r) { return r || fetch(req).then(function (res) { return keep(req, res); }); }));
});
