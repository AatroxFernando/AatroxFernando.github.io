/**
 * Service worker do Registro Fotográfico.
 * Guarda a tela do app no celular para abrir SEM internet.
 *
 * IMPORTANTE: sempre que mudar o index.html (ou outro arquivo), aumente a VERSAO
 * abaixo (v1 -> v2 -> v3...). É isso que faz os celulares baixarem a versão nova.
 */
var VERSAO = 'v6';
var CACHE = 'registro-obras-' + VERSAO;
var ARQUIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(ARQUIVOS.map(function (u) { return new Request(u, { cache: 'reload' }); }));
  }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) {
      return n.indexOf('registro-obras-') === 0 && n !== CACHE;
    }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

// O app pede para trocar para a versão nova quando a pessoa toca em "Atualizar"
self.addEventListener('message', function (e) {
  if (e.data === 'ATUALIZAR') self.skipWaiting();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;                              // envios (POST) vão direto para a internet
  if (new URL(req.url).origin !== self.location.origin) return;  // Google, Play Store etc.: não mexe

  // Abrir o app: sempre a tela guardada (funciona sem sinal)
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./index.html', { ignoreSearch: true }).then(function (r) {
      return r || fetch(req);
    }));
    return;
  }
  // Demais arquivos: primeiro o guardado, senão a internet
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (r) {
    return r || fetch(req);
  }));
});
