// ===================================================================
// FIREBASE CONFIG - SOFTZEN V2.1
// Compatible con Firebase v8 (CDN)
// ===================================================================

// Configuración de Firebase para SoftZen
const firebaseConfig = {
  apiKey: "AIzaSyBJeqVMFusCntqBhA5RLlM5XSgsV_hOf38",
  authDomain: "pagina-yoga.firebaseapp.com",
  projectId: "pagina-yoga",
  storageBucket: "pagina-yoga.firebasestorage.app",
  messagingSenderId: "292008599562",
  appId: "1:292008599562:web:6b9a8e795306e32c7dbff3"
};

// === CONSTANTES ===
const COLLECTIONS = {
  USERS: 'users',
  PATIENTS: 'patients',
  INSTRUCTORS: 'instructors',
  THERAPIES: 'therapies',
  SERIES: 'series',
  SESSIONS: 'sessions',
  POSTURES: 'postures',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications',
  EXPORTS: 'exports'
};

const STORAGE_PATHS = {
  PROFILE_IMAGES: 'profile_images',
  SERIES_IMAGES: 'series_images',
  SESSION_IMAGES: 'session_images',
  POSTURE_IMAGES: 'posture_images',
  POSTURE_VIDEOS: 'posture_videos',
  EXPORTS: 'exports',
  PUBLIC: 'public'
};

const USER_ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  PATIENT: 'patient'
};

// === INICIALIZACIÓN DE FIREBASE ===
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseStorage = null;

// Función de inicialización
function initializeFirebase() {
  try {
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase SDK no disponible');
      return false;
    }

    // Inicializar Firebase solo una vez
    if (!firebaseApp) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
      console.log('🔥 Firebase App inicializada');
    }

    // Configurar Auth
    if (!firebaseAuth) {
      firebaseAuth = firebase.auth();
      // Configurar persistencia
      firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
          console.log('🔐 Persistencia de autenticación configurada');
        })
        .catch((error) => {
          console.warn('⚠️ Error configurando persistencia:', error);
        });
    }

    // Configurar Firestore
    if (!firebaseDb) {
      firebaseDb = firebase.firestore();
      
      // Habilitar cache offline
      firebaseDb.enablePersistence({ synchronizeTabs: true })
        .then(() => {
          console.log('💾 Cache offline habilitado');
        })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('⚠️ Cache offline: múltiples pestañas detectadas');
          } else if (err.code === 'unimplemented') {
            console.warn('⚠️ Cache offline no soportado en este navegador');
          }
        });
    }

    // Configurar Storage
    if (!firebaseStorage) {
      firebaseStorage = firebase.storage();
      console.log('📁 Firebase Storage inicializado');
    }

    console.log('✅ Firebase completamente inicializado');
    return true;

  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    return false;
  }
}

// === MANEJO DE ERRORES ===
function handleFirebaseError(error) {
  const errorMap = {
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'El email ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'Email inválido',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'permission-denied': 'No tienes permisos para esta acción',
    'not-found': 'Documento no encontrado'
  };

  const message = errorMap[error.code] || error.message || 'Error desconocido';
  
  console.error('Firebase Error:', {
    code: error.code,
    message: error.message,
    timestamp: new Date().toISOString()
  });

  return {
    code: error.code,
    message: message,
    originalError: error
  };
}

// === INICIALIZAR INMEDIATAMENTE ===
(function() {
  // Esperar un momento para que Firebase SDK se cargue
  if (typeof firebase !== 'undefined') {
    initializeFirebase();
  } else {
    // Si Firebase no está listo, esperar
    let attempts = 0;
    const maxAttempts = 50; // 5 segundos máximo
    
    const checkFirebase = setInterval(() => {
      attempts++;
      
      if (typeof firebase !== 'undefined') {
        clearInterval(checkFirebase);
        initializeFirebase();
        
        // Hacer servicios disponibles globalmente
        window.firebaseServices = {
          app: firebaseApp,
          auth: firebaseAuth,
          db: firebaseDb,
          storage: firebaseStorage,
          isInitialized: function() {
            return !!(firebaseApp && firebaseAuth && firebaseDb);
          }
        };
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('firebaseReady', {
          detail: { timestamp: Date.now() }
        }));
      } else if (attempts >= maxAttempts) {
        clearInterval(checkFirebase);
        console.error('❌ Firebase SDK no se pudo cargar después de 5 segundos');
      }
    }, 100);
  }
})();

// === CONFIGURACIÓN GLOBAL ===
window.SOFTZEN_CONFIG = {
  COLLECTIONS,
  STORAGE_PATHS,
  USER_ROLES,
  firebaseConfig
};

console.log('🔧 Firebase Config v2.1 cargado');