// ===================================================================
// SETUP DEMO DATA - SOFTZEN V2.1
// Script para configurar datos de demostración en Firebase
// ===================================================================

// Función principal para configurar demo
async function setupDemoData() {
    console.log('🚀 Iniciando configuración de datos demo...');
    
    // Esperar a que Firebase esté listo
    await waitForFirebase();
    
    try {
        // 1. Crear usuarios demo
        await createDemoUsers();
        
        // 2. Crear series de terapia predefinidas
        await createDemoTherapies();
        
        // 3. Asignar series a pacientes demo
        await assignSeriesToDemoPatients();
        
        // 4. Crear algunas sesiones de ejemplo
        await createDemoSessions();
        
        console.log('✅ Datos demo configurados exitosamente');
        showSuccess('Datos demo configurados correctamente');
        
    } catch (error) {
        console.error('❌ Error configurando datos demo:', error);
        showError('Error al configurar datos demo');
    }
}

// Esperar a que Firebase esté listo
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (window.firebaseServices && window.firebaseServices.isInitialized()) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
    });
}

// Crear usuarios demo
async function createDemoUsers() {
    console.log('👥 Creando usuarios demo...');
    
    const demoUsers = [
        {
            email: 'admin@softzen.com',
            password: 'SoftZen2024',
            userData: {
                name: 'Dr. Carlos Mendoza',
                userType: 'instructor',
                isActive: true,
                specialty: 'Yoga Terapéutico',
                experience: '15 años'
            }
        },
        {
            email: 'paciente@softzen.com',
            password: 'SoftZen2024',
            userData: {
                name: 'María García',
                userType: 'patient',
                isActive: true,
                age: 35,
                condition: 'Dolor de espalda crónico'
            }
        },
        {
            email: 'paciente2@softzen.com',
            password: 'SoftZen2024',
            userData: {
                name: 'Juan Pérez',
                userType: 'patient',
                isActive: true,
                age: 42,
                condition: 'Ansiedad y estrés laboral'
            }
        },
        {
            email: 'paciente3@softzen.com',
            password: 'SoftZen2024',
            userData: {
                name: 'Ana Rodríguez',
                userType: 'patient',
                isActive: true,
                age: 55,
                condition: 'Artritis reumatoide'
            }
        }
    ];
    
    for (const user of demoUsers) {
        try {
            // Verificar si el usuario ya existe
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(
                user.email,
                user.password
            );
            
            // Guardar datos adicionales en Firestore
            await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                ...user.userData,
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`✅ Usuario creado: ${user.email}`);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`ℹ️ Usuario ya existe: ${user.email}`);
            } else {
                console.error(`❌ Error creando usuario ${user.email}:`, error);
            }
        }
    }
}

// Crear series de terapia demo
async function createDemoTherapies() {
    console.log('🧘‍♀️ Creando series de terapia demo...');
    
    if (!window.THERAPY_DATA) {
        console.error('❌ No se encontraron datos de terapias');
        return;
    }
    
    const demoSeries = [
        {
            name: 'Serie Básica para Ansiedad',
            therapyType: 'anxiety',
            totalSessions: 10,
            postures: window.THERAPY_DATA.anxiety.postures.slice(0, 4).map(p => ({
                ...p,
                duration: 5
            })),
            description: 'Serie diseñada para principiantes con ansiedad',
            level: 'Principiante'
        },
        {
            name: 'Serie Completa para Ansiedad',
            therapyType: 'anxiety',
            totalSessions: 15,
            postures: window.THERAPY_DATA.anxiety.postures.map(p => ({
                ...p,
                duration: p.defaultDuration
            })),
            description: 'Serie completa para manejo de ansiedad',
            level: 'Intermedio'
        },
        {
            name: 'Serie para Artritis - Movilidad',
            therapyType: 'arthritis',
            totalSessions: 12,
            postures: window.THERAPY_DATA.arthritis.postures.slice(0, 5).map(p => ({
                ...p,
                duration: 3
            })),
            description: 'Enfocada en mejorar la movilidad articular',
            level: 'Principiante'
        },
        {
            name: 'Serie Intensiva para Dolor de Espalda',
            therapyType: 'back_pain',
            totalSessions: 20,
            postures: window.THERAPY_DATA.back_pain.postures.map(p => ({
                ...p,
                duration: p.defaultDuration
            })),
            description: 'Programa completo para aliviar el dolor de espalda',
            level: 'Intermedio'
        }
    ];
    
    for (const series of demoSeries) {
        try {
            const docRef = await firebase.firestore().collection('therapies').add({
                ...series,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: 'demo-setup'
            });
            
            console.log(`✅ Serie creada: ${series.name}`);
        } catch (error) {
            console.error(`❌ Error creando serie ${series.name}:`, error);
        }
    }
}

// Asignar series a pacientes demo
async function assignSeriesToDemoPatients() {
    console.log('📋 Asignando series a pacientes demo...');
    
    try {
        // Obtener usuarios pacientes
        const usersSnapshot = await firebase.firestore()
            .collection('users')
            .where('userType', '==', 'patient')
            .get();
        
        const patients = [];
        usersSnapshot.forEach(doc => {
            patients.push({ id: doc.id, ...doc.data() });
        });
        
        // Obtener series disponibles
        const seriesSnapshot = await firebase.firestore()
            .collection('therapies')
            .get();
        
        const series = [];
        seriesSnapshot.forEach(doc => {
            series.push({ id: doc.id, ...doc.data() });
        });
        
        // Asignar series según la condición del paciente
        for (const patient of patients) {
            let assignedSeries = null;
            
            if (patient.condition?.includes('espalda')) {
                assignedSeries = series.find(s => s.therapyType === 'back_pain');
            } else if (patient.condition?.includes('Ansiedad') || patient.condition?.includes('estrés')) {
                assignedSeries = series.find(s => s.therapyType === 'anxiety' && s.level === 'Principiante');
            } else if (patient.condition?.includes('Artritis')) {
                assignedSeries = series.find(s => s.therapyType === 'arthritis');
            }
            
            if (assignedSeries) {
                await firebase.firestore().collection('users').doc(patient.id).update({
                    assignedSeries: JSON.stringify({
                        id: assignedSeries.id,
                        ...assignedSeries
                    }),
                    currentSession: 0,
                    seriesAssignedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                console.log(`✅ Serie asignada a ${patient.name}`);
            }
        }
    } catch (error) {
        console.error('❌ Error asignando series:', error);
    }
}

// Crear sesiones de ejemplo
async function createDemoSessions() {
    console.log('📊 Creando sesiones de ejemplo...');
    
    try {
        // Obtener paciente demo principal
        const usersSnapshot = await firebase.firestore()
            .collection('users')
            .where('email', '==', 'paciente@softzen.com')
            .get();
        
        if (usersSnapshot.empty) return;
        
        const patient = { id: usersSnapshot.docs[0].id, ...usersSnapshot.docs[0].data() };
        
        if (!patient.assignedSeries) return;
        
        const seriesData = JSON.parse(patient.assignedSeries);
        
        // Crear 5 sesiones de ejemplo
        const sessions = [
            {
                patientId: patient.id,
                seriesId: seriesData.id,
                sessionNumber: 1,
                painBefore: 8,
                painAfter: 6,
                comments: 'Primera sesión, me sentí un poco rígida al principio pero mejoré al final.',
                duration: 45,
                completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                patientId: patient.id,
                seriesId: seriesData.id,
                sessionNumber: 2,
                painBefore: 7,
                painAfter: 5,
                comments: 'Mejor que la primera vez, las posturas fluyen más naturalmente.',
                duration: 50,
                completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                patientId: patient.id,
                seriesId: seriesData.id,
                sessionNumber: 3,
                painBefore: 6,
                painAfter: 4,
                comments: 'Notable mejoría, puedo mantener las posturas por más tiempo.',
                duration: 48,
                completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                patientId: patient.id,
                seriesId: seriesData.id,
                sessionNumber: 4,
                painBefore: 5,
                painAfter: 3,
                comments: 'Excelente progreso, el dolor de espalda casi ha desaparecido.',
                duration: 52,
                completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                patientId: patient.id,
                seriesId: seriesData.id,
                sessionNumber: 5,
                painBefore: 4,
                painAfter: 2,
                comments: '¡Me siento genial! La práctica regular está dando resultados.',
                duration: 55,
                completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        for (const session of sessions) {
            await firebase.firestore().collection('sessions').add(session);
        }
        
        // Actualizar progreso del paciente
        await firebase.firestore().collection('users').doc(patient.id).update({
            currentSession: 5,
            lastSessionAt: sessions[sessions.length - 1].completedAt
        });
        
        console.log(`✅ ${sessions.length} sesiones creadas para ${patient.name}`);
        
    } catch (error) {
        console.error('❌ Error creando sesiones:', error);
    }
}

// Función para verificar si ya existen datos demo
async function checkDemoData() {
    try {
        const usersSnapshot = await firebase.firestore()
            .collection('users')
            .where('email', '==', 'admin@softzen.com')
            .get();
        
        return !usersSnapshot.empty;
    } catch (error) {
        console.error('Error verificando datos demo:', error);
        return false;
    }
}

// Auto-ejecutar si es la primera vez
window.addEventListener('firebaseReady', async () => {
    const demoExists = await checkDemoData();
    
    if (!demoExists) {
        console.log('🔍 No se encontraron datos demo, creando...');
        
        // Mostrar opción al usuario
        if (window.location.pathname.includes('setup-demo.html')) {
            // Si estamos en la página de setup, ejecutar automáticamente
            await setupDemoData();
        } else {
            // En la página principal, mostrar notificación
            setTimeout(() => {
                if (window.notificationSystem) {
                    window.notificationSystem.show({
                        type: 'info',
                        title: '🚀 Configuración Inicial',
                        message: '¿Deseas cargar datos de demostración?',
                        duration: 0,
                        actions: [
                            {
                                text: 'Sí, cargar demo',
                                class: 'btn-primary',
                                onClick: 'setupDemoData()'
                            },
                            {
                                text: 'No, gracias',
                                class: 'btn-secondary',
                                onClick: 'console.log("Demo omitido")'
                            }
                        ]
                    });
                }
            }, 3000);
        }
    }
});

// Hacer función disponible globalmente
window.setupDemoData = setupDemoData;

console.log('🎯 Setup Demo v2.1 cargado');