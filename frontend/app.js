// SoftZen - Aplicación Principal v2.1

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
    currentSection: 'therapies'
};

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log(`[${APP_CONFIG.name}] Iniciando aplicación v${APP_CONFIG.version}...`);
    
    // Inicializar componentes
    initializeApp();
});

// Función principal de inicialización
async function initializeApp() {
    try {
        // Configurar estado online/offline
        setupNetworkStatus();
        
        // Configurar tabs de autenticación
        setupAuthTabs();
        
        // Configurar toggle de contraseña
        setupPasswordToggle();
        
        // Ocultar pantalla de carga después de 2 segundos
        setTimeout(() => {
            hideLoadingScreen();
        }, 2000);
        
        // Inicializar autenticación cuando esté lista
        if (window.authModule) {
            window.authModule.initAuth();
        } else {
            // Si auth.js no está cargado, esperar
            const checkAuth = setInterval(() => {
                if (window.authModule) {
                    clearInterval(checkAuth);
                    window.authModule.initAuth();
                }
            }, 100);
        }
        
    } catch (error) {
        console.error('[App] Error durante inicialización:', error);
        showError('Error al inicializar la aplicación');
    }
}

// Configurar estado de red
function setupNetworkStatus() {
    // Actualizar estado inicial
    updateNetworkStatus(navigator.onLine);
    
    // Escuchar cambios de conexión
    window.addEventListener('online', () => {
        appState.isOnline = true;
        updateNetworkStatus(true);
        showSuccess('Conexión restaurada');
    });
    
    window.addEventListener('offline', () => {
        appState.isOnline = false;
        updateNetworkStatus(false);
        showError('Sin conexión a internet');
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

// Ocultar pantalla de carga
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const authContainer = document.getElementById('authContainer');
    
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            if (authContainer) {
                authContainer.classList.remove('hidden');
            }
        }, 500);
    }
}

// Utilidades de UI
function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    
    document.body.appendChild(errorEl);
    
    setTimeout(() => {
        errorEl.remove();
    }, 5000);
}

function showSuccess(message) {
    const successEl = document.createElement('div');
    successEl.className = 'success-message';
    successEl.textContent = message;
    
    document.body.appendChild(successEl);
    
    setTimeout(() => {
        successEl.remove();
    }, 3000);
}

// API Helper
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

// Hacer funciones globales disponibles
window.showError = showError;
window.showSuccess = showSuccess;
window.apiRequest = apiRequest;
window.APP_CONFIG = APP_CONFIG;
window.appState = appState;
window.updateNetworkStatus = updateNetworkStatus;