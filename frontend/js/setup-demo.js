// Script para crear usuarios demo en Firebase
// Ejecutar este script una sola vez para configurar los usuarios de prueba

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBJeqVMFusCntqBhA5RLlM5XSgsV_hOf38",
  authDomain: "pagina-yoga.firebaseapp.com",
  projectId: "pagina-yoga",
  storageBucket: "pagina-yoga.firebasestorage.app",
  messagingSenderId: "292008599562",
  appId: "1:292008599562:web:6b9a8e795306e32c7dbff3"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Función para crear usuarios demo
async function createDemoUsers() {
    console.log('🚀 Iniciando creación de usuarios demo...');
    
    const demoUsers = [
        {
            email: 'admin@softzen.com',
            password: 'SoftZen2024',
            userData: {
                name: 'Instructor Demo',
                userType: 'instructor',
                isActive: true,
                isDemo: true
            }
        },
        {
            email: 'paciente@softzen.com',
            password: 'SoftZen2024',
            userData: {
                name: 'Paciente Demo',
                userType: 'patient',
                isActive: true,
                isDemo: true
            }
        }
    ];
    
    for (const user of demoUsers) {
        try {
            // Intentar crear el usuario
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(
                user.email, 
                user.password
            );
            
            // Guardar datos adicionales en Firestore
            await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                ...user.userData,
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`✅ Usuario creado: ${user.email}`);
            
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`⚠️ Usuario ya existe: ${user.email}`);
            } else {
                console.error(`❌ Error creando ${user.email}:`, error);
            }
        }
    }
    
    // Cerrar sesión después de crear usuarios
    await firebase.auth().signOut();
    console.log('✅ Proceso completado');
}

// Función para crear terapias demo
async function createDemoTherapies() {
    console.log('🧘 Creando terapias demo...');
    
    const therapies = [
        {
            name: 'Yoga Suave para Principiantes',
            description: 'Introducción suave al yoga terapéutico con posturas básicas',
            duration: 30,
            level: 'Principiante',
            category: 'Relajación',
            type: 'stress_relief'
        },
        {
            name: 'Respiración Consciente',
            description: 'Técnicas de respiración para reducir el estrés y la ansiedad',
            duration: 20,
            level: 'Todos',
            category: 'Respiración',
            type: 'anxiety'
        },
        {
            name: 'Yoga para Dolor de Espalda',
            description: 'Secuencia especializada para aliviar dolores de espalda',
            duration: 45,
            level: 'Intermedio',
            category: 'Terapéutico',
            type: 'back_pain'
        },
        {
            name: 'Meditación Guiada',
            description: 'Sesión de meditación para calmar la mente',
            duration: 25,
            level: 'Todos',
            category: 'Meditación',
            type: 'relaxation'
        },
        {
            name: 'Yoga Restaurativo',
            description: 'Posturas pasivas para una relajación profunda',
            duration: 60,
            level: 'Todos',
            category: 'Restaurativo',
            type: 'sleep'
        }
    ];
    
    for (const therapy of therapies) {
        try {
            await firebase.firestore().collection('therapies').add({
                ...therapy,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isDemo: true
            });
            console.log(`✅ Terapia creada: ${therapy.name}`);
        } catch (error) {
            console.error(`❌ Error creando terapia ${therapy.name}:`, error);
        }
    }
}

// Ejecutar si se carga directamente
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Agregar botones al HTML para ejecutar las funciones
        if (document.getElementById('createUsers')) {
            document.getElementById('createUsers').addEventListener('click', createDemoUsers);
        }
        if (document.getElementById('createTherapies')) {
            document.getElementById('createTherapies').addEventListener('click', createDemoTherapies);
        }
    });
}