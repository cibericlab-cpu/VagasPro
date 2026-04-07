// ═══════════════════════════════════════════════════
// VagasPro · Service Worker · Ciberic.Lab
// Cache Strategy: Network First + Offline Fallback
// ═══════════════════════════════════════════════════

const CACHE_NAME    = 'vagaspro-v2';
const CACHE_STATIC  = 'vagaspro-static-v2';

// Assets to cache on install
const PRECACHE = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&family=Nunito+Sans:wght@300;400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
];

// ── Install ─────────────────────────────────────────
self.addEventListener('install', function(event) {
  console.log('[SW] Installing VagasPro v2...');
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(function(cache) {
        return cache.addAll(PRECACHE.map(function(url) {
          return new Request(url, { mode: 'no-cors' });
        }));
      })
      .then(function() {
        console.log('[SW] Pre-cache complete');
        return self.skipWaiting();
      })
      .catch(function(err) {
        console.warn('[SW] Pre-cache error (non-fatal):', err);
        return self.skipWaiting();
      })
  );
});

// ── Activate ────────────────────────────────────────
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(key) {
            return key !== CACHE_NAME && key !== CACHE_STATIC;
          })
          .map(function(key) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(function() {
      console.log('[SW] Active and controlling');
      return self.clients.claim();
    })
  );
});

// ── Fetch ────────────────────────────────────────────
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Skip non-GET and chrome-extension
  if (event.request.method !== 'GET') return;
  if (url.startsWith('chrome-extension://')) return;
  if (url.includes('supabase.co')) return; // never cache API calls

  event.respondWith(
    // Network first strategy
    fetch(event.request)
      .then(function(response) {
        // Cache valid responses
        if (response && response.status === 200 && response.type !== 'opaque') {
          var clone = response.clone();
          caches.open(CACHE_STATIC).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        // Network failed → try cache
        return caches.match(event.request).then(function(cached) {
          if (cached) return cached;

          // Offline fallback for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html')
              || caches.match('./')
              || new Response(
                  '<html><body style="font-family:sans-serif;text-align:center;padding:60px">'
                  + '<h2>📡 Sem conexão</h2>'
                  + '<p>O VagasPro está offline. Verifique sua conexão e tente novamente.</p>'
                  + '<button onclick="location.reload()" style="margin-top:20px;padding:12px 24px;background:#5b6af0;color:white;border:none;border-radius:999px;font-size:15px;cursor:pointer;">Tentar novamente</button>'
                  + '</body></html>',
                  { headers: { 'Content-Type': 'text/html' } }
                );
          }
          return new Response('', { status: 408 });
        });
      })
  );
});

// ── Push Notifications ───────────────────────────────
self.addEventListener('push', function(event) {
  if (!event.data) return;
  try {
    var data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'VagasPro', {
        body:    data.body    || 'Nova atualização disponível',
        icon:    data.icon    || './icons/icon-192x192.png',
        badge:   data.badge   || './icons/icon-96x96.png',
        tag:     data.tag     || 'vagaspro',
        data:    data.url     || '/',
        actions: data.actions || [],
      })
    );
  } catch(e) {
    console.warn('[SW] Push parse error:', e);
  }
});

// ── Notification Click ───────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(windowClients) {
        for (var i = 0; i < windowClients.length; i++) {
          if ('focus' in windowClients[i]) {
            windowClients[i].focus();
            return;
          }
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});
