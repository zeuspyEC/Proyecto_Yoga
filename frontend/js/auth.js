// Módulo de Autenticación Completo - SoftZen v2.1 - FIXED VERSION

// Estado de autenticación
let currentUser = null;
let isAuthInitialized = false;
let authInitAttempts = 0;
const MAX_AUTH_INIT_ATTEMPTS = 3;

// Elementos del DOM
const authForms = {
    login: null,
    register: null
};

// Inicializar autenticación con reintentos
function initAuth() {
    authInitAttempts++;
    console.log(`[Auth] Inicializando sistema de autenticación... (intento ${authInitAttempts}/${MAX_AUTH_INIT_ATTEMPTS})`);
    
    // Verificar si Firebase está listo
    if (!window.firebaseServices || !window.firebaseServices.isInitialized()) {
        console.log('[Auth] Esperando servicios de Firebase...');
        
        if (authInitAttempts < MAX_AUTH_INIT_ATTEMPTS) {
            setTimeout(() => {
                initAuth();
            }, 1000);
        } else {
            console.error('[Auth] Firebase no se inicializó después de múltiples intentos');
            showError('Error al inicializar el sistema de autenticación');
        }
        return;
    }
    
    try {
        // Obtener elementos del DOM
        authForms.login = document.getElementById('loginForm');
        authForms.register = document.getElementById('registerForm');
        
        // Configurar formularios
        setupAuthForms();
        
        // Configurar observador de autenticación con manejo robusto
        setupAuthStateObserver();
        
        isAuthInitialized = true;
        console.log('[Auth] Sistema de autenticación inicializado correctamente');
        
    } catch (error) {
        console.error('[Auth] Error inicializando autenticación:', error);
        
        if (authInitAttempts < MAX_AUTH_INIT_ATTEMPTS) {
            setTimeout(() => {
                initAuth();
            }, 2000);
        } else {
            showError('Error crítico en el sistema de autenticación');
        }
    }
}

// Configurar observador de estado de autenticación
function setupAuthStateObserver() {
    firebase.auth().onAuthStateChanged(async (user) => {
        try {
            console.log('[Auth] Estado de autenticación cambió:', user ? user.email : 'Sin usuario');
            
            if (user) {
                currentUser = user;
                
                // Cargar datos adicionales del usuario
                await loadUserData(user);
                
                // Manejar éxito de autenticación
                await handleAuthSuccess(user);
            } else {
                currentUser = null;
                handleAuthSignOut();
            }
        } catch (error) {
            console.error('[Auth] Error en cambio de autenticación:', error);
            handleAuthError(error);
        }
    }, (error) => {
        console.error('[Auth] Error en observer de auth:', error);
        handleAuthError(error);
    });
}

// Cargar datos adicionales del usuario
async function loadUserData(user) {
    try {
        console.log('[Auth] Cargando datos del usuario:', user.uid);
        
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            user.userData = userData;
            user.userType = userData.userType;
            user.displayName = userData.name || user.email.split('@')[0];
            
            console.log('[Auth] Datos del usuario cargados:', userData);
        } else {
            console.warn('[Auth] No se encontraron datos adicionales del usuario');
            // Crear datos básicos si no existen
            const basicUserData = {
                name: user.email.split('@')[0],
                email: user.email,
                userType: 'patient', // Por defecto
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: true
            };
            
            await firebase.firestore().collection('users').doc(user.uid).set(basicUserData);
            user.userData = basicUserData;
            user.userType = 'patient';
        }
    } catch (error) {
        console.error('[Auth] Error cargando datos del usuario:', error);
        // Continuar sin datos adicionales
        user.userData = {
            name: user.email.split('@')[0],
            email: user.email,
            userType: 'patient'
        };
        user.userType = 'patient';
    }
}

// Configurar formularios de autenticación
function setupAuthForms() {
    // Formulario de login
    if (authForms.login) {
        authForms.login.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin();
        });
        console.log('[Auth] Formulario de login configurado');
    }
    
    // Formulario de registro
    if (authForms.register) {
        authForms.register.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleRegister();
        });
        console.log('[Auth] Formulario de registro configurado');
    }
    
    // Botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        console.log('[Auth] Botón de logout configurado');
    }

    // Configurar campos dinámicos para el tipo de usuario
    setupUserTypeHandler();
}

// Configurar manejador de tipo de usuario
function setupUserTypeHandler() {
    const userTypeSelect = document.getElementById('userType');
    if (userTypeSelect) {
        userTypeSelect.addEventListener('change', (e) => {
            handleUserTypeChange(e.target.value);
        });
    }
}

// Manejar cambio de tipo de usuario
function handleUserTypeChange(userType) {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    // Remover campos dinámicos previos
    const existingFields = registerForm.querySelectorAll('.dynamic-field');
    existingFields.forEach(field => field.remove());

    if (userType === 'patient') {
        // Crear campos adicionales para pacientes
        const ageField = createFormField('age', 'Edad', 'number', 'Tu edad (18-100)', true);
        const conditionField = createConditionField();
        
        // Configurar validación de edad
        const ageInput = ageField.querySelector('input');
        ageInput.min = '18';
        ageInput.max = '100';
        
        // Insertar campos antes del botón de submit
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        registerForm.insertBefore(ageField, submitBtn);
        registerForm.insertBefore(conditionField, submitBtn);
    } else if (userType === 'instructor') {
        // Crear campos adicionales para instructores
        const specializationField = createSpecializationField();
        const experienceField = createFormField('experience', 'Años de Experiencia', 'number', 'Años de experiencia', true);
        
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        registerForm.insertBefore(specializationField, submitBtn);
        registerForm.insertBefore(experienceField, submitBtn);
    }
}

// Crear campo de formulario
function createFormField(id, label, type, placeholder, required = false) {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-group dynamic-field';
    
    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', id);
    labelEl.textContent = label;
    
    const inputEl = document.createElement('input');
    inputEl.type = type;
    inputEl.id = id;
    inputEl.name = id;
    inputEl.className = 'form-input';
    inputEl.placeholder = placeholder;
    if (required) inputEl.required = true;
    
    fieldDiv.appendChild(labelEl);
    fieldDiv.appendChild(inputEl);
    
    return fieldDiv;
}

// Crear campo de condición médica
function createConditionField() {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-group dynamic-field';
    
    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', 'condition');
    labelEl.textContent = 'Condición/Objetivo Principal';
    
    const selectEl = document.createElement('select');
    selectEl.id = 'condition';
    selectEl.name = 'condition';
    selectEl.className = 'form-select';
    selectEl.required = true;
    
    const conditions = [
        { value: '', text: 'Selecciona tu objetivo principal' },
        { value: 'anxiety', text: 'Ansiedad y Manejo del Estrés' },
        { value: 'back_pain', text: 'Dolor de Espalda y Cervical' },
        { value: 'arthritis', text: 'Artritis y Rigidez Articular' },
        { value: 'sleep', text: 'Problemas de Sueño e Insomnio' },
        { value: 'depression', text: 'Depresión y Estado de Ánimo' },
        { value: 'chronic_pain', text: 'Dolor Crónico General' },
        { value: 'flexibility', text: 'Mejorar Flexibilidad' },
        { value: 'balance', text: 'Equilibrio y Coordinación' },
        { value: 'general', text: 'Bienestar General' }
    ];
    
    conditions.forEach(condition => {
        const option = document.createElement('option');
        option.value = condition.value;
        option.textContent = condition.text;
        selectEl.appendChild(option);
    });
    
    fieldDiv.appendChild(labelEl);
    fieldDiv.appendChild(selectEl);
    
    return fieldDiv;
}

// Crear campo de especialización
function createSpecializationField() {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-group dynamic-field';
    
    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', 'specialization');
    labelEl.textContent = 'Especialización Principal';
    
    const selectEl = document.createElement('select');
    selectEl.id = 'specialization';
    selectEl.name = 'specialization';
    selectEl.className = 'form-select';
    selectEl.required = true;
    
    const specializations = [
        { value: '', text: 'Selecciona tu especialización' },
        { value: 'therapeutic', text: 'Yoga Terapéutico' },
        { value: 'hatha', text: 'Hatha Yoga' },
        { value: 'vinyasa', text: 'Vinyasa Flow' },
        { value: 'yin', text: 'Yin Yoga' },
        { value: 'restorative', text: 'Yoga Restaurativo' },
        { value: 'meditation', text: 'Meditación y Mindfulness' },
        { value: 'prenatal', text: 'Yoga Prenatal' },
        { value: 'senior', text: 'Yoga para Adultos Mayores' },
        { value: 'rehabilitation', text: 'Rehabilitación Física' }
    ];
    
    specializations.forEach(spec => {
        const option = document.createElement('option');
        option.value = spec.value;
        option.textContent = spec.text;
        selectEl.appendChild(option);
    });
    
    fieldDiv.appendChild(labelEl);
    fieldDiv.appendChild(selectEl);
    
    return fieldDiv;
}

// Manejar inicio de sesión
async function handleLogin() {
    try {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        // Validaciones
        if (!validateEmail(email)) {
            showError('Por favor ingresa un email válido');
            return;
        }
        
        if (!validatePassword(password)) {
            showError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        // Mostrar loading
        setLoadingState(true, 'Iniciando sesión...');
        console.log('[Auth] Intentando login para:', email);
        
        // Intentar login
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        
        // Actualizar último login
        await firebase.firestore().collection('users').doc(userCredential.user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => {
            console.warn('[Auth] Error actualizando lastLogin:', error);
            // No es crítico, continuar
        });
        
        console.log('[Auth] Login exitoso');
        
    } catch (error) {
        console.error('[Auth] Error en login:', error);
        setLoadingState(false);
        showError(formatFirebaseError(error.code));
    }
}

// Manejar registro
async function handleRegister() {
    try {
        const formData = getRegisterFormData();
        
        // Validaciones
        if (!validateRegisterData(formData)) {
            return;
        }
        
        // Mostrar loading
        setLoadingState(true, 'Creando cuenta...');
        console.log('[Auth] Creando cuenta para:', formData.email);
        
        // Crear usuario en Firebase Auth
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(
            formData.email, 
            formData.password
        );
        
        // Preparar datos del usuario
        const userData = {
            name: formData.name,
            email: formData.email,
            userType: formData.userType,
            isActive: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Agregar datos específicos según el tipo de usuario
        if (formData.userType === 'patient') {
            userData.age = parseInt(formData.age);
            userData.condition = formData.condition;
            userData.painLevel = 5; // Nivel inicial de dolor
            userData.sessionsCompleted = 0;
        } else if (formData.userType === 'instructor') {
            userData.specialization = formData.specialization;
            userData.experience = parseInt(formData.experience);
            userData.patientsCount = 0;
            userData.isVerified = false; // Requiere verificación admin
        }
        
        // Guardar datos en Firestore
        await firebase.firestore().collection('users').doc(userCredential.user.uid).set(userData);
        
        console.log('[Auth] Registro exitoso');
        showSuccess('¡Cuenta creada exitosamente! Bienvenido a SoftZen');
        
    } catch (error) {
        console.error('[Auth] Error en registro:', error);
        setLoadingState(false);
        showError(formatFirebaseError(error.code));
    }
}

// Obtener datos del formulario de registro
function getRegisterFormData() {
    return {
        name: document.getElementById('registerName').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        password: document.getElementById('registerPassword').value,
        userType: document.getElementById('userType').value,
        age: document.getElementById('age')?.value,
        condition: document.getElementById('condition')?.value,
        specialization: document.getElementById('specialization')?.value,
        experience: document.getElementById('experience')?.value
    };
}

// Validar datos de registro
function validateRegisterData(data) {
    if (!data.name) {
        showError('El nombre es requerido');
        return false;
    }
    
    if (!validateEmail(data.email)) {
        showError('Por favor ingresa un email válido');
        return false;
    }
    
    if (!validatePassword(data.password)) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    
    if (!data.userType) {
        showError('Selecciona el tipo de usuario');
        return false;
    }
    
    if (data.userType === 'patient') {
        if (!data.age || data.age < 18 || data.age > 100) {
            showError('La edad debe estar entre 18 y 100 años');
            return false;
        }
        
        if (!data.condition) {
            showError('Selecciona tu condición u objetivo principal');
            return false;
        }
    }
    
    if (data.userType === 'instructor') {
        if (!data.specialization) {
            showError('Selecciona tu especialización');
            return false;
        }
        
        if (!data.experience || data.experience < 0) {
            showError('Ingresa tus años de experiencia');
            return false;
        }
    }
    
    return true;
}

// Manejar logout
async function handleLogout() {
    try {
        setLoadingState(true, 'Cerrando sesión...');
        console.log('[Auth] Cerrando sesión...');
        
        await firebase.auth().signOut();
        
        showSuccess('Sesión cerrada correctamente');
        
        // Recargar página para limpiar estado
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('[Auth] Error en logout:', error);
        setLoadingState(false);
        showError('Error al cerrar sesión');
    }
}

// Manejar autenticación exitosa
async function handleAuthSuccess(user) {
    try {
        console.log('[Auth] Manejando autenticación exitosa para:', user.email);
        
        // Ocultar loading y auth containers
        hideLoadingScreen();
        hideAuthContainer();
        
        // Mostrar dashboard
        showDashboard();
        
        // Actualizar UI con datos del usuario
        updateUserUI(user);
        
        // Inicializar dashboard con reintentos
        await initializeDashboardWithRetry(user);
        
        // Mostrar notificación de bienvenida después de un momento
        setTimeout(() => {
            const welcomeMessage = `¡Bienvenido${user.userData?.name ? ` ${user.userData.name}` : ''}!`;
            showSuccess(welcomeMessage);
        }, 1000);
        
    } catch (error) {
        console.error('[Auth] Error manejando autenticación exitosa:', error);
        showError('Error al cargar el dashboard');
        // Fallback - mostrar auth container
        showAuthContainer();
    }
}

// Manejar cierre de sesión
function handleAuthSignOut() {
    console.log('[Auth] Manejando cierre de sesión');
    
    hideLoadingScreen();
    hideDashboard();
    showAuthContainer();
}

// Manejar errores de autenticación
function handleAuthError(error) {
    console.error('[Auth] Error de autenticación:', error);
    
    hideLoadingScreen();
    hideDashboard();
    showAuthContainer();
    
    showError('Error en el sistema de autenticación. Por favor, intenta nuevamente.');
}

// Inicializar dashboard con reintentos
async function initializeDashboardWithRetry(user, maxRetries = 3) {
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            console.log(`[Auth] Inicializando dashboard (intento ${retries + 1}/${maxRetries})`);
            
            // Verificar si el módulo de dashboard está disponible
            if (!window.dashboardModule) {
                console.log('[Auth] Dashboard module no disponible, cargando...');
                await loadScript('js/dashboard-complete.js');
                
                // Esperar un momento para que se procese
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            if (window.dashboardModule && typeof window.dashboardModule.init === 'function') {
                await window.dashboardModule.init(user);
                console.log('[Auth] Dashboard inicializado correctamente');
                return true;
            } else {
                throw new Error('Dashboard module no está disponible o no tiene método init');
            }
            
        } catch (error) {
            retries++;
            console.error(`[Auth] Error inicializando dashboard (intento ${retries}):`, error);
            
            if (retries < maxRetries) {
                console.log(`[Auth] Reintentando en 2 segundos...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error('[Auth] Falló la inicialización del dashboard después de todos los reintentos');
                showError('Error al cargar el dashboard. La aplicación puede no funcionar correctamente.');
                return false;
            }
        }
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
            console.error(`[Auth] Error cargando script: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
    });
}

// Funciones de UI

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500);
        console.log('[Auth] Loading screen ocultado');
    }
}

function hideAuthContainer() {
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.classList.add('hidden');
        console.log('[Auth] Auth container ocultado');
    }
}

function showAuthContainer() {
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.classList.remove('hidden');
        console.log('[Auth] Auth container mostrado');
    }
}

function showDashboard() {
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (dashboardContainer) {
        dashboardContainer.classList.remove('hidden');
        console.log('[Auth] Dashboard mostrado');
    } else {
        console.error('[Auth] Dashboard container no encontrado');
    }
}

function hideDashboard() {
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (dashboardContainer) {
        dashboardContainer.classList.add('hidden');
        console.log('[Auth] Dashboard ocultado');
    }
}

// Actualizar UI con datos del usuario
function updateUserUI(user) {
    const userNameElements = document.querySelectorAll('.user-name');
    const userEmailElements = document.querySelectorAll('.user-email');
    
    const displayName = user.displayName || user.userData?.name || user.email.split('@')[0];
    
    userNameElements.forEach(el => {
        el.textContent = displayName;
    });
    
    userEmailElements.forEach(el => {
        el.textContent = user.email;
    });
    
    // Ocultar elementos específicos de instructor si es paciente
    if (user.userType === 'patient') {
        document.querySelectorAll('.instructor-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    console.log('[Auth] UI actualizada para usuario:', displayName);
}

// Estado de loading
function setLoadingState(loading, message = 'Procesando...') {
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(btn => {
        btn.disabled = loading;
        if (loading) {
            btn.dataset.originalText = btn.textContent;
            btn.textContent = message;
        } else if (btn.dataset.originalText) {
            btn.textContent = btn.dataset.originalText;
        }
    });
}

// Utilidades de validación
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

// Formatear errores de Firebase
function formatFirebaseError(errorCode) {
    const errors = {
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/invalid-email': 'Email inválido',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
        'auth/network-request-failed': 'Error de conexión',
        'auth/invalid-credential': 'Credenciales inválidas',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada'
    };
    return errors[errorCode] || 'Error desconocido. Intenta nuevamente';
}

// Utilidades de UI
function showError(message) {
    if (window.showNotification) {
        window.showNotification(message, 'error');
    } else {
        console.error('Error:', message);
        alert('Error: ' + message);
    }
}

function showSuccess(message) {
    if (window.showNotification) {
        window.showNotification(message, 'success');
    } else {
        console.log('Success:', message);
    }
}

// Hacer funciones disponibles globalmente
window.authModule = {
    initAuth,
    currentUser: () => currentUser,
    isInitialized: () => isAuthInitialized,
    showError,
    showSuccess,
    handleLogout,
    
    // Método para forzar reinicialización
    forceReinit: () => {
        isAuthInitialized = false;
        authInitAttempts = 0;
        initAuth();
    }
};

console.log('[Auth] Módulo de autenticación completo cargado');
