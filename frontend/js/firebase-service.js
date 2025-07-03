// Firebase Service - Gestión centralizada de Firebase
// SoftZen v2.1 - Compatible con Firebase v8

// Esperar a que Firebase esté listo
function waitForFirebase() {
    return new Promise((resolve) => {
        if (window.firebaseServices && window.firebaseServices.isInitialized()) {
            resolve();
        } else {
            window.addEventListener('firebaseReady', resolve, { once: true });
        }
    });
}

// Servicio de Autenticación
const authService = {
    // Registro de usuario
    async register(email, password, userData) {
        await waitForFirebase();
        try {
            // Crear usuario con Firebase Auth
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Guardar datos adicionales en Firestore
            await firebase.firestore().collection('users').doc(user.uid).set({
                ...userData,
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true, user };
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, error: error.code };
        }
    },

    // Inicio de sesión
    async login(email, password) {
        await waitForFirebase();
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Actualizar último login
            await firebase.firestore().collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true, user };
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: error.code };
        }
    },

    // Cerrar sesión
    async logout() {
        await waitForFirebase();
        try {
            await firebase.auth().signOut();
            return { success: true };
        } catch (error) {
            console.error('Error en logout:', error);
            return { success: false, error: error.message };
        }
    },

    // Obtener usuario actual
    getCurrentUser() {
        if (window.firebaseServices && window.firebaseServices.auth) {
            return firebase.auth().currentUser;
        }
        return null;
    },

    // Observar cambios en autenticación
    onAuthChange(callback) {
        waitForFirebase().then(() => {
            firebase.auth().onAuthStateChanged(callback);
        });
    }
};

// Servicio de Base de Datos
const dbService = {
    // Usuarios
    users: {
        async get(userId) {
            await waitForFirebase();
            try {
                const doc = await firebase.firestore().collection('users').doc(userId).get();
                if (doc.exists) {
                    return { success: true, data: doc.data() };
                }
                return { success: false, error: 'Usuario no encontrado' };
            } catch (error) {
                console.error('Error obteniendo usuario:', error);
                return { success: false, error: error.message };
            }
        },

        async update(userId, data) {
            await waitForFirebase();
            try {
                await firebase.firestore().collection('users').doc(userId).update({
                    ...data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { success: true };
            } catch (error) {
                console.error('Error actualizando usuario:', error);
                return { success: false, error: error.message };
            }
        },

        async getAll() {
            await waitForFirebase();
            try {
                const snapshot = await firebase.firestore().collection('users').get();
                const users = [];
                snapshot.forEach(doc => {
                    users.push({ id: doc.id, ...doc.data() });
                });
                return { success: true, data: users };
            } catch (error) {
                console.error('Error obteniendo usuarios:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Terapias
    therapies: {
        async create(therapyData) {
            await waitForFirebase();
            try {
                const docRef = await firebase.firestore().collection('therapies').add({
                    ...therapyData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { success: true, id: docRef.id };
            } catch (error) {
                console.error('Error creando terapia:', error);
                return { success: false, error: error.message };
            }
        },

        async getAll() {
            await waitForFirebase();
            try {
                const snapshot = await firebase.firestore()
                    .collection('therapies')
                    .orderBy('createdAt', 'desc')
                    .get();
                const therapies = [];
                snapshot.forEach(doc => {
                    therapies.push({ id: doc.id, ...doc.data() });
                });
                return { success: true, data: therapies };
            } catch (error) {
                console.error('Error obteniendo terapias:', error);
                // Si el error es por índice faltante, intentar sin ordenar
                if (error.code === 'failed-precondition') {
                    try {
                        const snapshot = await firebase.firestore()
                            .collection('therapies')
                            .get();
                        const therapies = [];
                        snapshot.forEach(doc => {
                            therapies.push({ id: doc.id, ...doc.data() });
                        });
                        return { success: true, data: therapies };
                    } catch (err) {
                        return { success: false, error: err.message };
                    }
                }
                return { success: false, error: error.message };
            }
        },

        async getByUser(userId) {
            await waitForFirebase();
            try {
                const snapshot = await firebase.firestore()
                    .collection('therapies')
                    .where('userId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();
                const therapies = [];
                snapshot.forEach(doc => {
                    therapies.push({ id: doc.id, ...doc.data() });
                });
                return { success: true, data: therapies };
            } catch (error) {
                console.error('Error obteniendo terapias:', error);
                // Si el error es por índice faltante, intentar sin ordenar
                if (error.code === 'failed-precondition') {
                    try {
                        const snapshot = await firebase.firestore()
                            .collection('therapies')
                            .where('userId', '==', userId)
                            .get();
                        const therapies = [];
                        snapshot.forEach(doc => {
                            therapies.push({ id: doc.id, ...doc.data() });
                        });
                        return { success: true, data: therapies };
                    } catch (err) {
                        return { success: false, error: err.message };
                    }
                }
                return { success: false, error: error.message };
            }
        },

        async update(therapyId, data) {
            await waitForFirebase();
            try {
                await firebase.firestore().collection('therapies').doc(therapyId).update({
                    ...data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { success: true };
            } catch (error) {
                console.error('Error actualizando terapia:', error);
                return { success: false, error: error.message };
            }
        },

        async delete(therapyId) {
            await waitForFirebase();
            try {
                await firebase.firestore().collection('therapies').doc(therapyId).delete();
                return { success: true };
            } catch (error) {
                console.error('Error eliminando terapia:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Sesiones
    sessions: {
        async create(sessionData) {
            await waitForFirebase();
            try {
                const docRef = await firebase.firestore().collection('sessions').add({
                    ...sessionData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { success: true, id: docRef.id };
            } catch (error) {
                console.error('Error creando sesión:', error);
                return { success: false, error: error.message };
            }
        },

        async getByUser(userId) {
            await waitForFirebase();
            try {
                const snapshot = await firebase.firestore()
                    .collection('sessions')
                    .where('userId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();
                const sessions = [];
                snapshot.forEach(doc => {
                    sessions.push({ id: doc.id, ...doc.data() });
                });
                return { success: true, data: sessions };
            } catch (error) {
                console.error('Error obteniendo sesiones:', error);
                // Si el error es por índice faltante, intentar sin ordenar
                if (error.code === 'failed-precondition') {
                    try {
                        const snapshot = await firebase.firestore()
                            .collection('sessions')
                            .where('userId', '==', userId)
                            .get();
                        const sessions = [];
                        snapshot.forEach(doc => {
                            sessions.push({ id: doc.id, ...doc.data() });
                        });
                        return { success: true, data: sessions };
                    } catch (err) {
                        return { success: false, error: err.message };
                    }
                }
                return { success: false, error: error.message };
            }
        }
    },

    // Reportes
    reports: {
        async create(reportData) {
            await waitForFirebase();
            try {
                const docRef = await firebase.firestore().collection('reports').add({
                    ...reportData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { success: true, id: docRef.id };
            } catch (error) {
                console.error('Error creando reporte:', error);
                return { success: false, error: error.message };
            }
        },

        async getByUser(userId, limitCount = 10) {
            await waitForFirebase();
            try {
                const snapshot = await firebase.firestore()
                    .collection('reports')
                    .where('userId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .limit(limitCount)
                    .get();
                const reports = [];
                snapshot.forEach(doc => {
                    reports.push({ id: doc.id, ...doc.data() });
                });
                return { success: true, data: reports };
            } catch (error) {
                console.error('Error obteniendo reportes:', error);
                // Si el error es por índice faltante, intentar sin ordenar
                if (error.code === 'failed-precondition') {
                    try {
                        const snapshot = await firebase.firestore()
                            .collection('reports')
                            .where('userId', '==', userId)
                            .limit(limitCount)
                            .get();
                        const reports = [];
                        snapshot.forEach(doc => {
                            reports.push({ id: doc.id, ...doc.data() });
                        });
                        return { success: true, data: reports };
                    } catch (err) {
                        return { success: false, error: err.message };
                    }
                }
                return { success: false, error: error.message };
            }
        }
    }
};

// Utilidades
const utils = {
    // Formatear errores de Firebase
    formatFirebaseError(errorCode) {
        const errors = {
            'auth/email-already-in-use': 'El email ya está registrado',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
            'auth/invalid-email': 'Email inválido',
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
            'auth/network-request-failed': 'Error de conexión',
            'auth/invalid-credential': 'Credenciales inválidas',
            'auth/email-already-exists': 'El email ya está en uso'
        };
        return errors[errorCode] || 'Error desconocido';
    },

    // Validar email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validar contraseña
    validatePassword(password) {
        return password && password.length >= 6;
    },

    // Generar ID único
    generateId() {
        if (window.firebaseServices && window.firebaseServices.db) {
            return firebase.firestore().collection('temp').doc().id;
        }
        return Date.now().toString();
    },

    // Formatear fecha
    formatDate(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Formatear hora
    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

// Hacer servicios disponibles globalmente
window.firebaseService = {
    authService,
    dbService,
    utils
};