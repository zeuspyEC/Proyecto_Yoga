// SoftZen - Aplicación Principal v2.1 - FIXED VERSION
// Aplicación de Yoga Terapéutico Completa

// Configuración global
const APP_CONFIG = {
    name: 'SoftZen',
    version: '2.1',
    apiUrl: window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api'
};

// Estado de la aplicación
let appState = {
    user: null,
    isOnline: navigator.onLine,
    currentSection: 'therapies',
    currentTherapy: null,
    isInitialized: false,
    initializationAttempts: 0
};

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log(`[${APP_CONFIG.name}] Iniciando aplicación v${APP_CONFIG.version}...`);
    
    // Dar tiempo a que los scripts se carguen
    setTimeout(() => {
        initializeApp();
    }, 100);
});

// Función principal de inicialización
async function initializeApp() {
    try {
        appState.initializationAttempts++;
        console.log(`[App] Intento de inicialización #${appState.initializationAttempts}`);
        
        // Configurar estado online/offline
        setupNetworkStatus();
        
        // Configurar tabs de autenticación
        setupAuthTabs();
        
        // Configurar formulario dinámico
        setupDynamicForms();
        
        // Configurar toggle de contraseña
        setupPasswordToggle();
        
        // Esperar a que Firebase esté listo con timeout
        const firebaseReady = await waitForFirebaseWithTimeout(10000);
        firebase.auth().onAuthStateChanged(async (user) => {
            
        if (user) {
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                document.body.setAttribute('data-user-type', userData.userType);
                
                // Si es paciente, agregar clase adicional
                if (userData.userType === 'patient') {
                    document.body.classList.add('patient-view');
                }
            }
        }
    });
        if (!firebaseReady) {
            console.error('[App] Firebase no se inicializó correctamente');
            showInitializationError();
            return;
        }
        
        // Inicializar módulo de notificaciones
        await initNotificationSystem();
        
        // Inicializar módulo de autenticación
        await initAuthModule();
        
        // Configurar listeners de Firebase Auth
        setupAuthStateListener();
        
        // Marcar como inicializado
        appState.isInitialized = true;
        console.log('[App] Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('[App] Error durante inicialización:', error);
        showInitializationError(error);
        
        // Reintentar después de 3 segundos si no hemos superado el límite
        if (appState.initializationAttempts < 3) {
            console.log('[App] Reintentando inicialización en 3 segundos...');
            setTimeout(() => {
                initializeApp();
            }, 3000);
        }
    }
}

// Esperar a que Firebase esté disponible con timeout
function waitForFirebaseWithTimeout(timeout = 10000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        // Verificar si ya está listo
        if (window.firebaseServices && window.firebaseServices.isInitialized()) {
            console.log('[App] Firebase ya está inicializado');
            resolve(true);
            return;
        }
        
        // Escuchar evento de Firebase listo
        const onFirebaseReady = (event) => {
            console.log('[App] Firebase está listo:', event.detail);
            window.removeEventListener('firebaseReady', onFirebaseReady);
            window.removeEventListener('firebaseError', onFirebaseError);
            resolve(true);
        };
        
        const onFirebaseError = (event) => {
            console.error('[App] Error de Firebase:', event.detail);
            window.removeEventListener('firebaseReady', onFirebaseReady);
            window.removeEventListener('firebaseError', onFirebaseError);
            resolve(false);
        };
        
        window.addEventListener('firebaseReady', onFirebaseReady);
        window.addEventListener('firebaseError', onFirebaseError);
        
        // Verificar periódicamente
        const checkInterval = setInterval(() => {
            if (window.firebaseServices && window.firebaseServices.isInitialized()) {
                clearInterval(checkInterval);
                window.removeEventListener('firebaseReady', onFirebaseReady);
                window.removeEventListener('firebaseError', onFirebaseError);
                resolve(true);
            }
            
            // Timeout
            if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                window.removeEventListener('firebaseReady', onFirebaseReady);
                window.removeEventListener('firebaseError', onFirebaseError);
                console.error('[App] Timeout esperando Firebase');
                resolve(false);
            }
        }, 100);
    });
}

// Inicializar módulo de autenticación
async function initAuthModule() {
    try {
        if (window.authModule && window.authModule.initAuth) {
            window.authModule.initAuth();
            console.log('[App] Módulo de autenticación inicializado');
        } else {
            console.error('[App] Módulo de autenticación no disponible');
            // Intentar cargar dinámicamente
            await loadScript('js/auth.js');
            if (window.authModule && window.authModule.initAuth) {
                window.authModule.initAuth();
            }
        }
    } catch (error) {
        console.error('[App] Error inicializando módulo de autenticación:', error);
    }
}

// Configurar listener de estado de autenticación
function setupAuthStateListener() {
    if (!firebase.auth) {
        console.error('[App] Firebase Auth no disponible');
        return;
    }
    
    firebase.auth().onAuthStateChanged(async (user) => {
        try {
            console.log('[App] Estado de autenticación cambió:', user ? user.email : 'No usuario');
            
            if (user) {
                await handleUserAuthenticated(user);
            } else {
                handleUserSignedOut();
            }
        } catch (error) {
            console.error('[App] Error en cambio de estado de auth:', error);
            showAuthContainer();
            hideLoadingScreen();
        }
    }, (error) => {
        console.error('[App] Error en listener de auth:', error);
        showAuthContainer();
        hideLoadingScreen();
    });
}

// Manejar usuario autenticado
async function handleUserAuthenticated(user) {
    try {
        console.log('[App] Procesando usuario autenticado:', user.email);
        appState.user = user;
        
        // Cargar datos del usuario desde Firestore
        const userData = await loadUserData(user.uid);
        if (userData) {
            user.userData = userData;
            user.userType = userData.userType;
            appState.user = user;
            console.log('[App] Datos del usuario cargados:', userData);
        }
        
        // Ocultar pantalla de carga y auth
        hideLoadingScreen();
        hideAuthContainer();
        
        // Mostrar dashboard
        showDashboard();
        
        // Inicializar dashboard con reintentos
        await initializeDashboardWithRetry(user);
        
        // Mostrar notificación de bienvenida
        const welcomeMessage = `¡Bienvenido ${userData?.name || user.email.split('@')[0]}!`;
        setTimeout(() => {
            showNotification(welcomeMessage, 'success');
        }, 1000);
        
    } catch (error) {
        console.error('[App] Error manejando usuario autenticado:', error);
        showInitializationError(error);
    }
}

// Inicializar dashboard con reintentos
async function initializeDashboardWithRetry(user, maxRetries = 3) {
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            console.log(`[App] Intentando inicializar dashboard (intento ${retries + 1}/${maxRetries})`);
            
            // Verificar si el módulo de dashboard está disponible
            if (!window.dashboardModule) {
                console.log('[App] Cargando módulo de dashboard...');
                await loadScript('js/dashboard-complete.js');
                
                // Esperar un momento para que se procese
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            if (window.dashboardModule && typeof window.dashboardModule.init === 'function') {
                await window.dashboardModule.init(user);
                console.log('[App] Dashboard inicializado correctamente');
                return true;
            } else {
                throw new Error('Módulo de dashboard no disponible');
            }
            
        } catch (error) {
            retries++;
            console.error(`[App] Error inicializando dashboard (intento ${retries}):`, error);
            
            if (retries < maxRetries) {
                console.log(`[App] Reintentando en 2 segundos...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error('[App] Falló la inicialización del dashboard después de todos los reintentos');
                showError('Error al cargar el dashboard. Por favor, recarga la página.');
                return false;
            }
        }
    }
}

// Manejar usuario desconectado
function handleUserSignedOut() {
    console.log('[App] Usuario desconectado');
    appState.user = null;
    
    hideLoadingScreen();
    hideDashboard();
    showAuthContainer();
}

// Cargar datos del usuario
async function loadUserData(uid) {
    try {
        const doc = await firebase.firestore().collection('users').doc(uid).get();
        if (doc.exists) {
            return doc.data();
        }
        console.warn('[App] No se encontraron datos del usuario en Firestore');
        return null;
    } catch (error) {
        console.error('[App] Error cargando datos del usuario:', error);
        return null;
    }
}

// Configurar estado de red
function setupNetworkStatus() {
    updateNetworkStatus(navigator.onLine);
    
    window.addEventListener('online', () => {
        appState.isOnline = true;
        updateNetworkStatus(true);
        showNotification('Conexión restaurada', 'success');
    });
    
    window.addEventListener('offline', () => {
        appState.isOnline = false;
        updateNetworkStatus(false);
        showNotification('Sin conexión a internet', 'warning');
    });
}

// Actualizar indicador de red
function updateNetworkStatus(isOnline) {
    const indicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    if (indicator && statusText) {
        if (isOnline) {
            indicator.textContent = '🟢';
            indicator.className = 'status-indicator online';
            statusText.textContent = 'Online';
        } else {
            indicator.textContent = '🔴';
            indicator.className = 'status-indicator offline';
            statusText.textContent = 'Offline';
        }
    }
}

// Configurar tabs de autenticación
function setupAuthTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Actualizar tabs activos
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Mostrar formulario correspondiente
            authForms.forEach(form => {
                if (form.id === `${targetTab}Form`) {
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });
        });
    });
}

// Configurar formularios dinámicos
function setupDynamicForms() {
    const userTypeSelect = document.getElementById('userType');
    const registerForm = document.getElementById('registerForm');
    
    if (userTypeSelect && registerForm) {
        userTypeSelect.addEventListener('change', (e) => {
            // Remover campos previos
            const existingFields = registerForm.querySelectorAll('.dynamic-field');
            existingFields.forEach(field => field.remove());
            
            if (e.target.value === 'patient') {
                // Agregar campo de edad para pacientes
                const ageField = createDynamicField('age', 'Edad', 'number', 'Tu edad', true);
                ageField.querySelector('input').min = '18';
                ageField.querySelector('input').max = '100';
                
                // Agregar campo de condición médica
                const conditionField = createDynamicField('condition', 'Condición/Objetivo', 'select', '', true);
                const conditionSelect = conditionField.querySelector('select');
                
                const conditions = [
                    { value: '', text: 'Selecciona tu objetivo' },
                    { value: 'anxiety', text: 'Ansiedad y Estrés' },
                    { value: 'back_pain', text: 'Dolor de Espalda' },
                    { value: 'arthritis', text: 'Artritis y Rigidez' },
                    { value: 'sleep', text: 'Problemas de Sueño' },
                    { value: 'general', text: 'Bienestar General' }
                ];
                
                conditions.forEach(condition => {
                    const option = document.createElement('option');
                    option.value = condition.value;
                    option.textContent = condition.text;
                    conditionSelect.appendChild(option);
                });
                
                // Insertar antes del botón de submit
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                registerForm.insertBefore(ageField, submitBtn);
                registerForm.insertBefore(conditionField, submitBtn);
            }
        });
    }
}

// Crear campo dinámico
function createDynamicField(id, label, type, placeholder, required = false) {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-group dynamic-field';
    
    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', id);
    labelEl.textContent = label;
    
    let inputEl;
    if (type === 'select') {
        inputEl = document.createElement('select');
        inputEl.className = 'form-select';
    } else {
        inputEl = document.createElement('input');
        inputEl.type = type;
        inputEl.className = 'form-input';
        inputEl.placeholder = placeholder;
    }
    
    inputEl.id = id;
    inputEl.name = id;
    if (required) inputEl.required = true;
    
    fieldDiv.appendChild(labelEl);
    fieldDiv.appendChild(inputEl);
    
    return fieldDiv;
}

// Configurar toggle de contraseña
function setupPasswordToggle() {
    const showPasswordCheckbox = document.getElementById('showPassword');
    const passwordInput = document.getElementById('registerPassword');
    
    if (showPasswordCheckbox && passwordInput) {
        showPasswordCheckbox.addEventListener('change', (e) => {
            passwordInput.type = e.target.checked ? 'text' : 'password';
        });
    }
}

// FUNCIONES DE UI

// Ocultar pantalla de carga
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500);
        console.log('[App] Pantalla de carga ocultada');
    }
}

// Mostrar contenedor de autenticación
function showAuthContainer() {
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.classList.remove('hidden');
        authContainer.style.opacity = '0';
        setTimeout(() => {
            authContainer.style.opacity = '1';
        }, 100);
        console.log('[App] Contenedor de auth mostrado');
    }
}

// Ocultar contenedor de autenticación
function hideAuthContainer() {
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.classList.add('hidden');
        console.log('[App] Contenedor de auth ocultado');
    }
}

// Mostrar dashboard
function showDashboard() {
    const dashboardContainer = document.getElementById('dashboardContainer');
    
    if (dashboardContainer) {
        dashboardContainer.classList.remove('hidden');
        dashboardContainer.style.opacity = '0';
        setTimeout(() => {
            dashboardContainer.style.opacity = '1';
        }, 100);
        console.log('[App] Dashboard mostrado');
    } else {
        console.error('[App] Contenedor de dashboard no encontrado');
    }
}

// Ocultar dashboard
function hideDashboard() {
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (dashboardContainer) {
        dashboardContainer.classList.add('hidden');
        console.log('[App] Dashboard ocultado');
    }
}

// Mostrar error de inicialización
function showInitializationError(error = null) {
    hideLoadingScreen();
    
    const errorMessage = error ? 
        `Error de inicialización: ${error.message || error}` : 
        'Error al inicializar la aplicación. Por favor, recarga la página.';
    
    // Mostrar en un elemento específico o crear uno
    let errorContainer = document.getElementById('initError');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'initError';
        errorContainer.className = 'init-error';
        errorContainer.innerHTML = `
            <div class="error-content">
                <h2>🚫 Error de Inicialización</h2>
                <p>${errorMessage}</p>
                <div class="error-actions">
                    <button onclick="window.location.reload()" class="btn-primary">
                        🔄 Recargar Página
                    </button>
                    <button onclick="clearAppData()" class="btn-secondary">
                        🗑️ Limpiar Datos y Recargar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(errorContainer);
    }
    
    console.error('[App] Error de inicialización mostrado:', errorMessage);
}

// Limpiar datos de la aplicación
window.clearAppData = async function() {
    try {
        console.log('[App] Limpiando datos de la aplicación...');
        
        // Limpiar Firebase data
        if (window.firebaseServices && window.firebaseServices.clearCorruptedData) {
            await window.firebaseServices.clearCorruptedData();
        }
        
        // Limpiar localStorage
        localStorage.clear();
        
        // Limpiar sessionStorage
        sessionStorage.clear();
        
        // Recargar página
        window.location.reload();
    } catch (error) {
        console.error('[App] Error limpiando datos:', error);
        window.location.reload();
    }
};

// Sistema de notificaciones
let notificationSystem = null;

async function initNotificationSystem() {
    try {
        // Cargar sistema de notificaciones
        if (!window.NotificationSystem) {
            await loadScript('js/notifications.js');
        }
        
        if (window.NotificationSystem) {
            notificationSystem = new window.NotificationSystem();
            console.log('[App] Sistema de notificaciones inicializado');
        }
    } catch (error) {
        console.error('[App] Error inicializando notificaciones:', error);
    }
}

// Mostrar notificación
function showNotification(message, type = 'info', duration = 5000) {
    if (notificationSystem) {
        notificationSystem.show({
            message,
            type,
            duration
        });
    } else {
        // Fallback básico
        console.log(`[${type.toUpperCase()}] ${message}`);
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            background: ${type === 'error' ? '#F56565' : type === 'success' ? '#48BB78' : type === 'warning' ? '#ED8936' : '#4299E1'};
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
}

// Cargar script dinámicamente
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => {
            console.error(`[App] Error cargando script: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
    });
}

// API Helper mejorado
async function apiRequest(endpoint, options = {}) {
    const url = `${APP_CONFIG.apiUrl}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('[API] Error:', error);
        throw error;
    }
}

// Utilidades globales
const Utils = {
    formatDate: (date) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    formatTime: (date) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    validatePassword: (password) => {
        return password && password.length >= 6;
    }
};

// Hacer funciones globales disponibles
window.showNotification = showNotification;
window.showError = (message) => showNotification(message, 'error');
window.showSuccess = (message) => showNotification(message, 'success');
window.showWarning = (message) => showNotification(message, 'warning');
window.showInfo = (message) => showNotification(message, 'info');
window.apiRequest = apiRequest;
window.APP_CONFIG = APP_CONFIG;
window.appState = appState;
window.Utils = Utils;
window.updateNetworkStatus = updateNetworkStatus;

console.log('[App] Aplicación principal cargada v2.1');
