/* QualTech Service Worker — يفعّل إمكانية تثبيت التطبيق (PWA) ويوفّر تخزيناً مؤقتاً أساسياً.
   ملاحظة: يجب رفع هذا الملف في المجلد الجذري نفسه الذي يحتوي على qualtech-irrigation.html
   على استضافة حقيقية تدعم HTTPS (مثل Donialabstech.online) لكي يعمل تسجيل Service Worker وميزة "تثبيت التطبيق". */

const CACHE_NAME = 'qualtech-cache-v1';
const ASSETS = [
  './qualtech-irrigation.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './favicon-48.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => cached);
    })
  );
});
