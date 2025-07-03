// Dashboard Module - SoftZen v2.1

let currentUser = null;
let currentSection = 'therapies';

// Inicializar Dashboard
async function initDashboard(user) {
    console.log('[Dashboard] Inicializando para usuario:', user.email);
    currentUser = user;
    
    // Configurar navegación
    setupNavigation();
    
    // Cargar datos del usuario
    await loadUserData();
    
    // Configurar botones de acción
    setupActionButtons();
    
    // Cargar sección inicial
    loadSection('therapies');
    
    // Actualizar estadísticas
    updateDashboardStats();
}

// Configurar navegación
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (section) {
                // Actualizar estado activo
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Cargar sección
                loadSection(section);
            }
        });
    });
}

// Cargar datos del usuario
async function loadUserData() {
    const result = await window.firebaseService.dbService.users.get(currentUser.uid);
    
    if (result.success) {
        const userData = result.data;
        
        // Actualizar nombre en la UI
        const userNameEl = document.querySelector('.user-name');
        if (userNameEl) {
            userNameEl.textContent = userData.name || currentUser.email.split('@')[0];
        }
        
        // Ocultar elementos de instructor si es paciente
        if (userData.userType === 'patient') {
            document.querySelectorAll('.instructor-only').forEach(el => {
                el.style.display = 'none';
            });
        }
        
        // Guardar tipo de usuario en currentUser
        currentUser.userType = userData.userType;
    }
}

// Configurar botones de acción
function setupActionButtons() {
    // Botón crear terapia
    const createTherapyBtn = document.getElementById('createTherapyBtn');
    if (createTherapyBtn) {
        createTherapyBtn.addEventListener('click', () => {
            showCreateTherapyModal();
        });
    }
    
    // Botón generar reporte
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', () => {
            generateReport();
        });
    }
    
    // Botón agregar usuario
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            showAddUserModal();
        });
    }
}

// Cargar sección
async function loadSection(section) {
    console.log('[Dashboard] Cargando sección:', section);
    currentSection = section;
    
    // Ocultar todas las secciones
    document.querySelectorAll('.dashboard-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Mostrar sección seleccionada
    const sectionEl = document.getElementById(`${section}Section`);
    if (sectionEl) {
        sectionEl.classList.remove('hidden');
        
        // Cargar contenido según la sección
        switch (section) {
            case 'therapies':
                await loadTherapies();
                break;
            case 'reports':
                await loadReports();
                break;
            case 'users':
                await loadUsers();
                break;
            case 'profile':
                await loadProfile();
                break;
        }
    }
}

// Cargar terapias
async function loadTherapies() {
    const therapiesList = document.getElementById('therapiesList');
    if (!therapiesList) return;
    
    therapiesList.innerHTML = '<div class="loading">Cargando terapias...</div>';
    
    try {
        // Primero intentar cargar desde la API local
        const response = await fetch(`${window.APP_CONFIG.apiUrl}/therapies`);
        let therapies = [];
        
        if (response.ok) {
            therapies = await response.json();
        } else {
            // Si falla, cargar desde Firebase
            const result = currentUser.userType === 'instructor' 
                ? await window.firebaseService.dbService.therapies.getAll()
                : await window.firebaseService.dbService.therapies.getByUser(currentUser.uid);
                
            if (result.success) {
                therapies = result.data;
            }
        }
        
        if (therapies.length > 0) {
            therapiesList.innerHTML = therapies.map(therapy => `
                <div class="therapy-card">
                    <h3>${therapy.name}</h3>
                    <p>${therapy.description}</p>
                    <div class="therapy-meta">
                        <span>⏱️ ${therapy.duration} min</span>
                        <span>🎯 ${therapy.type || therapy.category || 'General'}</span>
                        <span>📊 ${therapy.level || 'Principiante'}</span>
                    </div>
                    <div class="therapy-actions">
                        <button class="btn-secondary" onclick="startTherapy('${therapy.id}')">
                            Iniciar Sesión
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            therapiesList.innerHTML = '<div class="no-data">No hay terapias disponibles</div>';
        }
    } catch (error) {
        console.error('[Dashboard] Error cargando terapias:', error);
        therapiesList.innerHTML = '<div class="error-message">Error al cargar las terapias</div>';
    }
}

// Cargar reportes
async function loadReports() {
    const reportsList = document.getElementById('reportsList');
    if (!reportsList) return;
    
    reportsList.innerHTML = '<div class="loading">Cargando reportes...</div>';
    
    try {
        const result = await window.firebaseService.dbService.reports.getByUser(currentUser.uid);
        
        if (result.success && result.data.length > 0) {
            reportsList.innerHTML = result.data.map(report => `
                <div class="report-card">
                    <h3>Reporte del ${window.firebaseService.utils.formatDate(report.createdAt)}</h3>
                    <p>Sesiones completadas: ${report.sessionsCount || 0}</p>
                    <div class="report-meta">
                        <span>📈 Progreso: ${report.progress || 0}%</span>
                        <span>⏱️ Tiempo total: ${report.totalTime || 0} min</span>
                    </div>
                    <div class="report-actions">
                        <button class="btn-secondary" onclick="viewReport('${report.id}')">
                            Ver Detalle
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            reportsList.innerHTML = '<div class="no-data">No hay reportes disponibles</div>';
        }
    } catch (error) {
        console.error('[Dashboard] Error cargando reportes:', error);
        reportsList.innerHTML = '<div class="error-message">Error al cargar los reportes</div>';
    }
}

// Cargar usuarios
async function loadUsers() {
    if (currentUser.userType !== 'instructor') return;
    
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    usersList.innerHTML = '<div class="loading">Cargando usuarios...</div>';
    
    try {
        const result = await window.firebaseService.dbService.users.getAll();
        
        if (result.success && result.data.length > 0) {
            const patients = result.data.filter(user => user.userType === 'patient');
            
            usersList.innerHTML = patients.map(user => `
                <div class="user-card">
                    <div class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                    <h4>${user.name || 'Usuario'}</h4>
                    <p>${user.email}</p>
                    <span class="user-status ${user.isActive ? 'active' : ''}">
                        ${user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            `).join('');
        } else {
            usersList.innerHTML = '<div class="no-data">No hay usuarios registrados</div>';
        }
    } catch (error) {
        console.error('[Dashboard] Error cargando usuarios:', error);
        usersList.innerHTML = '<div class="error-message">Error al cargar los usuarios</div>';
    }
}

// Cargar perfil
async function loadProfile() {
    const profileInfo = document.getElementById('profileInfo');
    if (!profileInfo) return;
    
    profileInfo.innerHTML = '<div class="loading">Cargando perfil...</div>';
    
    try {
        const result = await window.firebaseService.dbService.users.get(currentUser.uid);
        
        if (result.success) {
            const userData = result.data;
            profileInfo.innerHTML = `
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar">${userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}</div>
                        <h3>${userData.name || 'Usuario'}</h3>
                        <p>${userData.email}</p>
                    </div>
                    <div class="profile-details">
                        <div class="detail-item">
                            <span class="label">Tipo de Usuario:</span>
                            <span class="value">${userData.userType === 'instructor' ? 'Instructor' : 'Paciente'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Estado:</span>
                            <span class="value">${userData.isActive ? 'Activo' : 'Inactivo'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Miembro desde:</span>
                            <span class="value">${window.firebaseService.utils.formatDate(userData.createdAt)}</span>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button class="btn-secondary" onclick="editProfile()">
                            Editar Perfil
                        </button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('[Dashboard] Error cargando perfil:', error);
        profileInfo.innerHTML = '<div class="error-message">Error al cargar el perfil</div>';
    }
}

// Actualizar estadísticas del dashboard
async function updateDashboardStats() {
    const statsContainer = document.getElementById('dashboardStats');
    if (!statsContainer) return;
    
    try {
        // Obtener estadísticas
        const therapiesResult = await window.firebaseService.dbService.therapies.getByUser(currentUser.uid);
        const sessionsResult = await window.firebaseService.dbService.sessions.getByUser(currentUser.uid);
        
        const therapiesCount = therapiesResult.success ? therapiesResult.data.length : 0;
        const sessionsCount = sessionsResult.success ? sessionsResult.data.length : 0;
        const totalTime = sessionsResult.success 
            ? sessionsResult.data.reduce((acc, session) => acc + (session.duration || 0), 0) 
            : 0;
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <h3>${therapiesCount}</h3>
                <p>Terapias Disponibles</p>
            </div>
            <div class="stat-card">
                <h3>${sessionsCount}</h3>
                <p>Sesiones Completadas</p>
            </div>
            <div class="stat-card">
                <h3>${totalTime}</h3>
                <p>Minutos de Práctica</p>
            </div>
            <div class="stat-card">
                <h3>${sessionsCount > 0 ? Math.round(sessionsCount / 7) : 0}</h3>
                <p>Semanas Activo</p>
            </div>
        `;
    } catch (error) {
        console.error('[Dashboard] Error actualizando estadísticas:', error);
    }
}

// Funciones globales para botones
window.startTherapy = function(therapyId) {
    console.log('Iniciando terapia:', therapyId);
    window.showSuccess('Función en desarrollo');
};

window.viewReport = function(reportId) {
    console.log('Viendo reporte:', reportId);
    window.showSuccess('Función en desarrollo');
};

window.editProfile = function() {
    console.log('Editando perfil');
    window.showSuccess('Función en desarrollo');
};

// Modal para crear terapia
function showCreateTherapyModal() {
    // Por ahora solo mostrar mensaje
    window.showSuccess('Función de crear terapia en desarrollo');
}

// Generar reporte
async function generateReport() {
    try {
        const sessionsResult = await window.firebaseService.dbService.sessions.getByUser(currentUser.uid);
        const sessionsCount = sessionsResult.success ? sessionsResult.data.length : 0;
        
        const reportData = {
            userId: currentUser.uid,
            sessionsCount: sessionsCount,
            progress: Math.min(100, sessionsCount * 10),
            totalTime: sessionsCount * 30
        };
        
        const result = await window.firebaseService.dbService.reports.create(reportData);
        
        if (result.success) {
            window.showSuccess('Reporte generado exitosamente');
            loadReports();
        } else {
            window.showError('Error al generar el reporte');
        }
    } catch (error) {
        console.error('[Dashboard] Error generando reporte:', error);
        window.showError('Error al generar el reporte');
    }
}

// Modal para agregar usuario
function showAddUserModal() {
    // Por ahora solo mostrar mensaje
    window.showSuccess('Función de agregar usuario en desarrollo');
}

// Hacer función disponible globalmente
window.initDashboard = initDashboard;