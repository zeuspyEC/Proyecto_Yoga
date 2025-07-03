// Módulo de Autenticación - SoftZen v2.1

// Estado de autenticación
let currentUser = null;

// Elementos del DOM
const authForms = {
    login: null,
    register: null
};

// Inicializar autenticación
function initAuth() {
    console.log('[Auth] Inicializando autenticación...');
    
    // Esperar a que los servicios estén listos
    if (!window.firebaseService) {
        console.log('[Auth] Esperando servicios de Firebase...');
        setTimeout(initAuth, 100);
        return;
    }
    
    // Obtener elementos del DOM
    authForms.login = document.getElementById('loginForm');
    authForms.register = document.getElementById('registerForm');
    
    // Observar cambios en autenticación
    window.firebaseService.authService.onAuthChange((user) => {
        if (user) {
            console.log('[Auth] Usuario autenticado:', user.email);
            currentUser = user;
            handleAuthSuccess(user);
        } else {
            console.log('[Auth] Usuario no autenticado');
            currentUser = null;
            showAuthForms();
        }
    });

    // Configurar formularios
    setupAuthForms();
}

// Configurar formularios de autenticación
function setupAuthForms() {
    // Configurar cambio de tipo de usuario para mostrar/ocultar campo de edad
    const userTypeSelect = document.getElementById('userType');
    const ageGroup = document.getElementById('ageGroup');
    
    if (userTypeSelect && ageGroup) {
        userTypeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'patient') {
                ageGroup.classList.remove('hidden');
                document.getElementById('registerAge').required = true;
            } else {
                ageGroup.classList.add('hidden');
                document.getElementById('registerAge').required = false;
            }
        });
    }
    
    // Formulario de login
    if (authForms.login) {
        authForms.login.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Validaciones
            if (!window.firebaseService.utils.validateEmail(email)) {
                showError('Email inválido');
                return;
            }
            
            if (!window.firebaseService.utils.validatePassword(password)) {
                showError('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            // Mostrar loading
            showLoading(true);
            
            // Intentar login
            const result = await window.firebaseService.authService.login(email, password);
            
            if (result.success) {
                showSuccess('¡Bienvenido!');
            } else {
                showError(window.firebaseService.utils.formatFirebaseError(result.error));
            }
            
            showLoading(false);
        });
    }
    
    // Formulario de registro
    if (authForms.register) {
        authForms.register.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const userType = document.getElementById('userType').value;
            const name = document.getElementById('registerName')?.value || '';
            const age = document.getElementById('registerAge')?.value || null;
            
            // Validaciones
            if (!window.firebaseService.utils.validateEmail(email)) {
                showError('Email inválido');
                return;
            }
            
            if (!window.firebaseService.utils.validatePassword(password)) {
                showError('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            if (!userType) {
                showError('Selecciona un tipo de usuario');
                return;
            }
            
            // Mostrar loading
            showLoading(true);
            
            // Datos del usuario
            const userData = {
                name,
                userType,
                isActive: true,
                createdAt: new Date().toISOString()
            };
            
            // Si es paciente, agregar edad
            if (userType === 'patient' && age) {
                userData.age = parseInt(age);
            }
            
            // Intentar registro
            const result = await window.firebaseService.authService.register(email, password, userData);
            
            if (result.success) {
                showSuccess('¡Registro exitoso! Bienvenido a SoftZen');
            } else {
                showError(window.firebaseService.utils.formatFirebaseError(result.error));
            }
            
            showLoading(false);
        });
    }
    
    // Botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const result = await window.firebaseService.authService.logout();
            if (result.success) {
                showSuccess('Sesión cerrada correctamente');
                window.location.reload();
            }
        });
    }
}

// Manejar autenticación exitosa
function handleAuthSuccess(user) {
    // Ocultar formularios de auth
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.classList.add('hidden');
    }
    
    // Mostrar dashboard
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (dashboardContainer) {
        dashboardContainer.classList.remove('hidden');
    }
    
    // Actualizar UI con datos del usuario
    updateUserUI(user);
    
    // Cargar dashboard
    loadDashboard();
}

// Mostrar formularios de autenticación
function showAuthForms() {
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.classList.remove('hidden');
    }
    
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (dashboardContainer) {
        dashboardContainer.classList.add('hidden');
    }
}

// Actualizar UI con datos del usuario
function updateUserUI(user) {
    const userNameElements = document.querySelectorAll('.user-name');
    const userEmailElements = document.querySelectorAll('.user-email');
    
    userNameElements.forEach(el => {
        el.textContent = user.displayName || user.email.split('@')[0];
    });
    
    userEmailElements.forEach(el => {
        el.textContent = user.email;
    });
}

// Cargar dashboard
async function loadDashboard() {
    // Verificar si el dashboard ya está cargado
    if (window.dashboardLoaded) {
        console.log('[Auth] Dashboard ya cargado');
        return;
    }
    
    // Cargar script del dashboard dinámicamente
    const script = document.createElement('script');
    script.src = '/js/dashboard.js';
    script.onload = () => {
        console.log('[Auth] Dashboard script cargado');
        if (window.initDashboard) {
            window.initDashboard(currentUser);
            window.dashboardLoaded = true;
        }
    };
    script.onerror = () => {
        console.error('[Auth] Error cargando dashboard script');
    };
    document.body.appendChild(script);
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

function showLoading(show) {
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(btn => {
        btn.disabled = show;
        if (show) {
            btn.dataset.originalText = btn.textContent;
            btn.textContent = 'Procesando...';
        } else if (btn.dataset.originalText) {
            btn.textContent = btn.dataset.originalText;
        }
    });
}

// Hacer funciones disponibles globalmente
window.authModule = {
    initAuth,
    currentUser: () => currentUser,
    showError,
    showSuccess
};