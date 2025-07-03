// Service Worker para SoftZen v2.1
const CACHE_NAME = 'softzen-v2.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/js/firebase-config.js',
  '/js/firebase-service.js',
  '/js/auth.js',
  '/js/dashboard.js'
];

// Instalar el Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker v2.1');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache abierto');
        // Intentar cachear cada archivo individualmente
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`[SW] No se pudo cachear: ${url}`, err);
            });
          })
        );
      })
      .then(() => {
        console.log('[SW] Instalación completada');
        return self.skipWaiting();
      })
  );
});

// Activar el Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activando Service Worker v2.1');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('softzen-')) {
            console.log('[SW] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activación completada');
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  // Ignorar peticiones que no son GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar peticiones a APIs externas y Firebase
  const url = new URL(event.request.url);
  if (!url.origin.includes('localhost') && !url.origin.includes(self.location.origin)) {
    return;
  }

  // Estrategia: Cache First, luego Network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Si está en cache, devolverlo
          return cachedResponse;
        }

        // Si no está en cache, buscarlo en la red
        return fetch(event.request)
          .then(response => {
            // Solo cachear respuestas exitosas
            if (!response || response.status !== 200) {
              return response;
            }

            // Solo cachear recursos del mismo origen
            if (url.origin === self.location.origin) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                })
                .catch(err => {
                  console.warn('[SW] Error al cachear:', err);
                });
            }

            return response;
          });
      })
      .catch(error => {
        console.error('[SW] Error en fetch:', error);
        
        // Si es una navegación, intentar mostrar index.html desde cache
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        
        // Para otros recursos, devolver error
        return new Response('Error de red', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

// Mensaje de estado
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker v2.1 cargado');