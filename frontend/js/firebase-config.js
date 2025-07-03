// ===================================================================
// FIREBASE CONFIG - SOFTZEN V2.1 - FIXED VERSION
// Compatible con Firebase v8 (CDN) - Corregido problema de persistencia
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
let isFirebaseInitialized = false;

// Función para limpiar IndexedDB corrupto
async function clearCorruptedIndexedDB() {
  try {
    // Limpiar datos de Firebase en IndexedDB
    if ('indexedDB' in window) {
      // Intentar eliminar las bases de datos de Firebase conocidas
      const dbNames = [
        'firebase-auth-db',
        'firebaseLocalStorageDb',
        'firebase-messaging-database',
        `firebase-heartbeat-store`,
        `firebase-installations-store`
      ];
      
      for (const dbName of dbNames) {
        try {
          await new Promise((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase(dbName);
            deleteReq.onsuccess = () => resolve();
            deleteReq.onerror = () => resolve(); // No rechazar si no existe
            deleteReq.onblocked = () => resolve();
          });
          console.log(`🗑️ Base de datos ${dbName} limpiada`);
        } catch (error) {
          // Continuar aunque falle la limpieza de una DB específica
          console.warn(`⚠️ No se pudo limpiar ${dbName}:`, error);
        }
      }
    }
    
    // También limpiar localStorage relacionado con Firebase
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('firebase') || key.includes('firestore'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`🗑️ localStorage key removed: ${key}`);
      } catch (error) {
        console.warn(`⚠️ Error removing localStorage key ${key}:`, error);
      }
    });
    
    console.log('✅ IndexedDB y localStorage limpiados');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando IndexedDB:', error);
    return false;
  }
}

// Función de inicialización mejorada
async function initializeFirebase() {
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
      
      // Configurar persistencia con manejo de errores mejorado
      try {
        await firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        console.log('🔐 Persistencia de autenticación configurada');
      } catch (error) {
        console.warn('⚠️ Error configurando persistencia de auth:', error);
        // Continuar sin persistencia si hay error
      }
    }

    // Configurar Firestore con manejo mejorado de errores
    if (!firebaseDb) {
      firebaseDb = firebase.firestore();
      
      // Intentar habilitar persistencia, pero continuar si falla
      try {
        await firebaseDb.enablePersistence({ 
          synchronizeTabs: true,
          experimentalForceOwningTab: true 
        });
        console.log('💾 Cache offline habilitado');
      } catch (err) {
        console.warn('⚠️ Error habilitando cache offline:', err.code);
        
        if (err.code === 'failed-precondition') {
          console.log('🔄 Intentando limpiar IndexedDB corrupto...');
          
          // Limpiar IndexedDB y reintentar
          await clearCorruptedIndexedDB();
          
          // Esperar un momento y reinicializar Firestore
          setTimeout(() => {
            try {
              firebaseDb = firebase.firestore();
              console.log('🔄 Firestore reinicializado después de limpieza');
            } catch (reinitError) {
              console.warn('⚠️ Error reinicializando Firestore:', reinitError);
            }
          }, 1000);
        } else if (err.code === 'unimplemented') {
          console.warn('⚠️ Cache offline no soportado en este navegador');
        }
        
        // Continuar sin persistencia
        console.log('📱 Continuando sin cache offline');
      }
    }

    // Configurar Storage
    if (!firebaseStorage) {
      firebaseStorage = firebase.storage();
      console.log('📁 Firebase Storage inicializado');
    }

    isFirebaseInitialized = true;
    console.log('✅ Firebase completamente inicializado');
    return true;

  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    
    // Si hay error crítico, intentar limpiar y reiniciar
    console.log('🔄 Intentando recuperación automática...');
    await clearCorruptedIndexedDB();
    
    return false;
  }
}

// === MANEJO DE ERRORES MEJORADO ===
function handleFirebaseError(error) {
  const errorMap = {
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'El email ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'Email inválido',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión',
    'permission-denied': 'No tienes permisos para esta acción',
    'not-found': 'Documento no encontrado',
    'failed-precondition': 'Error de configuración de base de datos',
    'unavailable': 'Servicio temporalmente no disponible'
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

// === SERVICIOS GLOBALES ===
const firebaseServices = {
  app: () => firebaseApp,
  auth: () => firebaseAuth,
  db: () => firebaseDb,
  storage: () => firebaseStorage,
  isInitialized: () => isFirebaseInitialized && !!(firebaseApp && firebaseAuth && firebaseDb),
  
  // Método para reinicializar en caso de problemas
  async reinitialize() {
    console.log('🔄 Reinicializando Firebase...');
    isFirebaseInitialized = false;
    await clearCorruptedIndexedDB();
    return await initializeFirebase();
  },
  
  // Método para limpiar datos corruptos
  async clearCorruptedData() {
    return await clearCorruptedIndexedDB();
  }
};

// === INICIALIZAR INMEDIATAMENTE ===
(async function() {
  // Esperar un momento para que Firebase SDK se cargue
  if (typeof firebase !== 'undefined') {
    await initializeFirebase();
    window.firebaseServices = firebaseServices;
    
    // Disparar evento cuando esté listo
    window.dispatchEvent(new CustomEvent('firebaseReady', {
      detail: { 
        timestamp: Date.now(),
        initialized: isFirebaseInitialized
      }
    }));
    
  } else {
    // Si Firebase no está listo, esperar
    let attempts = 0;
    const maxAttempts = 50; // 5 segundos máximo
    
    const checkFirebase = setInterval(async () => {
      attempts++;
      
      if (typeof firebase !== 'undefined') {
        clearInterval(checkFirebase);
        
        await initializeFirebase();
        window.firebaseServices = firebaseServices;
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('firebaseReady', {
          detail: { 
            timestamp: Date.now(),
            initialized: isFirebaseInitialized
          }
        }));
        
      } else if (attempts >= maxAttempts) {
        clearInterval(checkFirebase);
        console.error('❌ Firebase SDK no se pudo cargar después de 5 segundos');
        
        // Disparar evento de error
        window.dispatchEvent(new CustomEvent('firebaseError', {
          detail: { 
            error: 'Firebase SDK failed to load',
            timestamp: Date.now()
          }
        }));
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

// Función de utilidad para verificar estado
window.checkFirebaseStatus = function() {
  return {
    isInitialized: isFirebaseInitialized,
    hasApp: !!firebaseApp,
    hasAuth: !!firebaseAuth,
    hasDb: !!firebaseDb,
    hasStorage: !!firebaseStorage
  };
};

console.log('🔧 Firebase Config v2.1 cargado');
