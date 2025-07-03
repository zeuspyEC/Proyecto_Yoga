// ===================================================================
// SERVICE WORKER - SOFTZEN V2.1
// PWA con funcionamiento offline completo
// ===================================================================

const CACHE_NAME = 'softzen-v2.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  // JavaScript files
  '/js/firebase-config.js',
  '/js/firebase-service.js',
  '/js/therapyData.js',
  '/js/notifications.js',
  '/js/auth.js',
  '/js/dashboard.js',
  // Firebase SDK (CDN)
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-storage.js'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker v2.1');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando archivos iniciales');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Instalación completada');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Error durante instalación:', error);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activando Service Worker v2.1');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activación completada');
        return self.clients.claim();
      })
  );
});

// Estrategia de caché: Network First con fallback a cache
self.addEventListener('fetch', event => {
  // Ignorar peticiones que no sean GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignorar peticiones a Firebase Auth
  if (event.request.url.includes('identitytoolkit.googleapis.com') ||
      event.request.url.includes('securetoken.googleapis.com')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Solo cachear respuestas exitosas
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clonar la respuesta
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Si falla la red, buscar en cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              console.log('[SW] Sirviendo desde cache:', event.request.url);
              return response;
            }
            
            // Si no está en cache, devolver página offline
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', event => {
  console.log('[SW] Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_IMAGES') {
    cacheImages(event.data.urls);
  }
});

// Función para cachear imágenes dinámicamente
function cacheImages(urls) {
  caches.open(CACHE_NAME)
    .then(cache => {
      urls.forEach(url => {
        fetch(url)
          .then(response => {
            if (response.ok) {
              cache.put(url, response);
            }
          })
          .catch(error => {
            console.error('[SW] Error cacheando imagen:', url, error);
          });
      });
    });
}

// Notificaciones push (preparado para futuras implementaciones)
self.addEventListener('push', event => {
  console.log('[SW] Push recibido');
  
  const title = 'SoftZen - Yoga Terapéutico';
  const options = {
    body: event.data ? event.data.text() : '¡Es hora de tu sesión de yoga!',
    icon: '/img/icon-192.png',
    badge: '/img/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'start',
        title: 'Iniciar Sesión',
        icon: '/img/action-start.png'
      },
      {
        action: 'later',
        title: 'Más Tarde',
        icon: '/img/action-later.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notificación clickeada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'start') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sincronización en background
self.addEventListener('sync', event => {
  console.log('[SW] Sincronización en background:', event.tag);
  
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncSessions());
  }
});

// Función para sincronizar sesiones pendientes
async function syncSessions() {
  // Implementar sincronización de sesiones offline
  console.log('[SW] Sincronizando sesiones pendientes...');
}

console.log('[SW] Service Worker v2.1 cargado');