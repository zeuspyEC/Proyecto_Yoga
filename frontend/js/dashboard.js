// ===================================================================
// DASHBOARD MODULE - SOFTZEN V2.1
// Gestión completa del dashboard con todas las funcionalidades
// ===================================================================

let currentUser = null;
let currentSection = 'therapies';
let userData = null;
let draggedElement = null;

// Inicializar Dashboard
async function initDashboard(user) {
    console.log('[Dashboard] Inicializando para usuario:', user.email);
    currentUser = user;
    
    // Cargar datos del usuario
    await loadUserData();
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar botones de acción
    setupActionButtons();
    
    // Configurar drag & drop
    setupDragAndDrop();
    
    // Cargar terapias predefinidas
    loadTherapyData();
    
    // Cargar sección inicial basada en el tipo de usuario
    if (userData.userType === 'patient') {
        loadSection('therapies');
        // Ocultar elementos de instructor
        document.querySelectorAll('.instructor-only').forEach(el => {
            el.style.display = 'none';
        });
    } else {
        loadSection('dashboard');
        updateDashboardStats();
    }
    
    // Iniciar actualizaciones periódicas
    startPeriodicUpdates();
}

// Cargar datos del usuario
async function loadUserData() {
    try {
        const result = await window.firebaseService.dbService.users.get(currentUser.uid);
        
        if (result.success) {
            userData = result.data;
            
            // Actualizar nombre en la UI
            const userNameEl = document.querySelector('.user-name');
            if (userNameEl) {
                userNameEl.textContent = userData.name || currentUser.email.split('@')[0];
            }
            
            // Guardar tipo de usuario en currentUser
            currentUser.userType = userData.userType;
        }
    } catch (error) {
        console.error('[Dashboard] Error cargando datos de usuario:', error);
    }
}

// Cargar datos de terapias predefinidas
function loadTherapyData() {
    // Cargar el archivo de terapias
    const script = document.createElement('script');
    script.src = '/js/therapyData.js';
    script.onload = () => {
        console.log('[Dashboard] Datos de terapias cargados');
    };
    script.onerror = () => {
        console.error('[Dashboard] Error cargando datos de terapias');
    };
    document.body.appendChild(script);
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

// Configurar drag & drop para reordenar
function setupDragAndDrop() {
    // Se configurará cuando se cargue la sección de series
}

// Cargar sección
async function loadSection(section) {
    console.log('[Dashboard] Cargando sección:', section);
    currentSection = section;
    
    // Ocultar todas las secciones
    document.querySelectorAll('.dashboard-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Si es instructor, mostrar dashboard primero
    if (userData.userType === 'instructor' && section === 'therapies') {
        // Mostrar dashboard stats en la parte superior
        const statsContainer = document.getElementById('dashboardStats');
        if (statsContainer) {
            statsContainer.classList.remove('hidden');
        }
    }
    
    // Mostrar sección seleccionada
    const sectionEl = document.getElementById(`${section}Section`);
    if (sectionEl) {
        sectionEl.classList.remove('hidden');
        
        // Cargar contenido según la sección
        switch (section) {
            case 'dashboard':
                await loadDashboardSection();
                break;
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

// Cargar sección de dashboard (solo instructores)
async function loadDashboardSection() {
    if (userData.userType !== 'instructor') return;
    
    // Crear sección de dashboard si no existe
    let dashboardSection = document.getElementById('dashboardSection');
    if (!dashboardSection) {
        dashboardSection = document.createElement('section');
        dashboardSection.id = 'dashboardSection';
        dashboardSection.className = 'dashboard-section';
        
        const mainContent = document.querySelector('.main-content');
        mainContent.appendChild(dashboardSection);
    }
    
    dashboardSection.innerHTML = `
        <div class="section-header">
            <h2>Panel de Control</h2>
            <button class="btn-secondary" onclick="window.dashboardModule.exportDashboard()">
                📊 Exportar Dashboard
            </button>
        </div>
        <div id="fullDashboard" class="full-dashboard">
            <div class="loading">Cargando dashboard...</div>
        </div>
    `;
    
    await updateFullDashboard();
}

// Actualizar dashboard completo
async function updateFullDashboard() {
    try {
        // Cargar todos los datos necesarios
        const [patientsResult, seriesResult, sessionsResult] = await Promise.all([
            window.firebaseService.dbService.users.getAll(),
            window.firebaseService.dbService.therapies.getAll(),
            window.firebaseService.dbService.sessions.getAll()
        ]);
        
        const patients = patientsResult.success ? patientsResult.data.filter(u => u.userType === 'patient') : [];
        const series = seriesResult.success ? seriesResult.data : [];
        const sessions = sessionsResult.success ? sessionsResult.data : [];
        
        // Calcular métricas
        const metrics = calculateMetrics(patients, series, sessions);
        
        // Renderizar dashboard
        const dashboardContainer = document.getElementById('fullDashboard');
        if (dashboardContainer) {
            dashboardContainer.innerHTML = `
                <div class="dashboard-grid">
                    ${renderMetricCards(metrics)}
                </div>
                
                <div class="dashboard-charts">
                    <div class="chart-container">
                        <h3>📊 Distribución de Terapias</h3>
                        <div id="therapyDistribution" class="chart">
                            ${renderTherapyDistribution(metrics.therapyDistribution)}
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <h3>📈 Progreso de Pacientes</h3>
                        <div id="patientProgress" class="chart">
                            ${renderPatientProgress(patients)}
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-tables">
                    <div class="table-container">
                        <h3>🏆 Top Pacientes por Progreso</h3>
                        ${renderTopPatients(patients, sessions)}
                    </div>
                    
                    <div class="table-container">
                        <h3>📅 Sesiones Recientes</h3>
                        ${renderRecentSessions(sessions, patients)}
                    </div>
                </div>
                
                <div class="dashboard-alerts">
                    <h3>🔔 Alertas y Notificaciones</h3>
                    ${renderAlerts(patients, sessions)}
                </div>
            `;
        }
    } catch (error) {
        console.error('[Dashboard] Error actualizando dashboard:', error);
    }
}

// Calcular métricas
function calculateMetrics(patients, series, sessions) {
    const activePatients = patients.filter(p => p.assignedSeries).length;
    const totalSessions = sessions.length;
    const avgSessionsPerPatient = patients.length > 0 ? Math.round(totalSessions / patients.length) : 0;
    
    // Distribución de terapias
    const therapyDistribution = {};
    if (window.THERAPY_DATA) {
        Object.keys(window.THERAPY_DATA).forEach(type => {
            therapyDistribution[type] = 0;
        });
    }
    
    patients.forEach(patient => {
        if (patient.assignedSeries) {
            try {
                const seriesData = JSON.parse(patient.assignedSeries);
                if (seriesData.therapyType) {
                    therapyDistribution[seriesData.therapyType] = (therapyDistribution[seriesData.therapyType] || 0) + 1;
                }
            } catch (e) {}
        }
    });
    
    // Calcular mejora promedio de dolor
    let totalImprovement = 0;
    let sessionCount = 0;
    sessions.forEach(session => {
        if (session.painBefore && session.painAfter) {
            totalImprovement += (session.painBefore - session.painAfter);
            sessionCount++;
        }
    });
    const avgPainImprovement = sessionCount > 0 ? (totalImprovement / sessionCount).toFixed(1) : 0;
    
    return {
        totalPatients: patients.length,
        activePatients,
        totalSessions,
        avgSessionsPerPatient,
        avgPainImprovement,
        therapyDistribution,
        completionRate: activePatients > 0 ? Math.round((totalSessions / (activePatients * 10)) * 100) : 0
    };
}

// Renderizar tarjetas de métricas
function renderMetricCards(metrics) {
    return `
        <div class="metric-card">
            <div class="metric-icon">👥</div>
            <div class="metric-content">
                <h3>Total Pacientes</h3>
                <div class="metric-value">${metrics.totalPatients}</div>
                <div class="metric-subtitle">${metrics.activePatients} activos</div>
            </div>
        </div>
        
        <div class="metric-card">
            <div class="metric-icon">🧘‍♀️</div>
            <div class="metric-content">
                <h3>Sesiones Completadas</h3>
                <div class="metric-value">${metrics.totalSessions}</div>
                <div class="metric-subtitle">${metrics.avgSessionsPerPatient} promedio/paciente</div>
            </div>
        </div>
        
        <div class="metric-card">
            <div class="metric-icon">📉</div>
            <div class="metric-content">
                <h3>Reducción de Dolor</h3>
                <div class="metric-value">-${metrics.avgPainImprovement}</div>
                <div class="metric-subtitle">Promedio por sesión</div>
            </div>
        </div>
        
        <div class="metric-card">
            <div class="metric-icon">✅</div>
            <div class="metric-content">
                <h3>Tasa de Completitud</h3>
                <div class="metric-value">${metrics.completionRate}%</div>
                <div class="metric-subtitle">De series asignadas</div>
            </div>
        </div>
    `;
}

// Renderizar distribución de terapias
function renderTherapyDistribution(distribution) {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
        return '<p class="no-data">No hay pacientes con terapias asignadas</p>';
    }
    
    return Object.entries(distribution).map(([type, count]) => {
        const percentage = Math.round((count / total) * 100);
        const therapyInfo = window.THERAPY_DATA ? window.THERAPY_DATA[type] : null;
        const name = therapyInfo ? therapyInfo.name : type;
        const color = therapyInfo ? therapyInfo.color : '#666';
        
        return `
            <div class="therapy-item">
                <span class="therapy-label">${name}</span>
                <div class="therapy-bar">
                    <div class="therapy-fill" style="width: ${percentage}%; background: ${color}"></div>
                </div>
                <span class="therapy-count">${count} (${percentage}%)</span>
            </div>
        `;
    }).join('');
}

// Renderizar progreso de pacientes
function renderPatientProgress(patients) {
    const activePatients = patients.filter(p => p.assignedSeries).slice(0, 5);
    
    if (activePatients.length === 0) {
        return '<p class="no-data">No hay pacientes activos</p>';
    }
    
    return activePatients.map(patient => {
        let progress = 0;
        let totalSessions = 0;
        
        try {
            const seriesData = JSON.parse(patient.assignedSeries);
            totalSessions = seriesData.totalSessions || 10;
            progress = Math.round(((patient.currentSession || 0) / totalSessions) * 100);
        } catch (e) {}
        
        return `
            <div class="patient-progress-item">
                <div class="patient-info">
                    <span class="patient-name">${patient.name}</span>
                    <span class="patient-sessions">${patient.currentSession || 0}/${totalSessions} sesiones</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-percentage">${progress}%</span>
            </div>
        `;
    }).join('');
}

// Renderizar top pacientes
function renderTopPatients(patients, sessions) {
    // Calcular estadísticas por paciente
    const patientStats = patients.map(patient => {
        const patientSessions = sessions.filter(s => s.patientId === patient.id);
        const totalSessions = patientSessions.length;
        
        let avgImprovement = 0;
        if (totalSessions > 0) {
            const totalImprovement = patientSessions.reduce((sum, s) => {
                return sum + ((s.painBefore || 0) - (s.painAfter || 0));
            }, 0);
            avgImprovement = (totalImprovement / totalSessions).toFixed(1);
        }
        
        return {
            ...patient,
            totalSessions,
            avgImprovement
        };
    }).sort((a, b) => b.avgImprovement - a.avgImprovement).slice(0, 5);
    
    if (patientStats.length === 0) {
        return '<p class="no-data">No hay datos disponibles</p>';
    }
    
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Paciente</th>
                    <th>Sesiones</th>
                    <th>Mejora Promedio</th>
                </tr>
            </thead>
            <tbody>
                ${patientStats.map(patient => `
                    <tr>
                        <td>${patient.name}</td>
                        <td>${patient.totalSessions}</td>
                        <td class="positive">-${patient.avgImprovement}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Renderizar sesiones recientes
function renderRecentSessions(sessions, patients) {
    const recentSessions = sessions
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 5);
    
    if (recentSessions.length === 0) {
        return '<p class="no-data">No hay sesiones registradas</p>';
    }
    
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Paciente</th>
                    <th>Dolor Antes</th>
                    <th>Dolor Después</th>
                    <th>Mejora</th>
                </tr>
            </thead>
            <tbody>
                ${recentSessions.map(session => {
                    const patient = patients.find(p => p.id === session.patientId);
                    const improvement = (session.painBefore || 0) - (session.painAfter || 0);
                    
                    return `
                        <tr>
                            <td>${new Date(session.completedAt).toLocaleDateString()}</td>
                            <td>${patient ? patient.name : 'Desconocido'}</td>
                            <td>${session.painBefore || 0}</td>
                            <td>${session.painAfter || 0}</td>
                            <td class="${improvement >= 0 ? 'positive' : 'negative'}">
                                ${improvement >= 0 ? '-' : '+'}${Math.abs(improvement)}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Renderizar alertas
function renderAlerts(patients, sessions) {
    const alerts = [];
    
    // Pacientes inactivos
    patients.forEach(patient => {
        const patientSessions = sessions.filter(s => s.patientId === patient.id);
        const lastSession = patientSessions.sort((a, b) => 
            new Date(b.completedAt) - new Date(a.completedAt)
        )[0];
        
        if (lastSession) {
            const daysSinceLastSession = Math.floor(
                (new Date() - new Date(lastSession.completedAt)) / (1000 * 60 * 60 * 24)
            );
            
            if (daysSinceLastSession > 7) {
                alerts.push({
                    type: 'warning',
                    icon: '⚠️',
                    message: `${patient.name} no ha tenido sesiones en ${daysSinceLastSession} días`
                });
            }
        } else if (patient.assignedSeries) {
            alerts.push({
                type: 'info',
                icon: 'ℹ️',
                message: `${patient.name} tiene una serie asignada pero no ha iniciado`
            });
        }
    });
    
    // Pacientes con dolor aumentado
    sessions.forEach(session => {
        if ((session.painAfter || 0) > (session.painBefore || 0)) {
            const patient = patients.find(p => p.id === session.patientId);
            if (patient) {
                alerts.push({
                    type: 'danger',
                    icon: '🚨',
                    message: `${patient.name} reportó aumento de dolor en su última sesión`
                });
            }
        }
    });
    
    // Pacientes cerca de completar serie
    patients.forEach(patient => {
        if (patient.assignedSeries && patient.currentSession) {
            try {
                const seriesData = JSON.parse(patient.assignedSeries);
                const remaining = (seriesData.totalSessions || 10) - patient.currentSession;
                
                if (remaining === 1) {
                    alerts.push({
                        type: 'success',
                        icon: '🎉',
                        message: `${patient.name} está a una sesión de completar su serie`
                    });
                }
            } catch (e) {}
        }
    });
    
    if (alerts.length === 0) {
        return '<p class="no-alerts">✅ No hay alertas activas</p>';
    }
    
    return alerts.slice(0, 5).map(alert => `
        <div class="alert alert-${alert.type}">
            <span class="alert-icon">${alert.icon}</span>
            <span class="alert-message">${alert.message}</span>
        </div>
    `).join('');
}

// Actualizar estadísticas del dashboard
async function updateDashboardStats() {
    const statsContainer = document.getElementById('dashboardStats');
    if (!statsContainer || userData.userType !== 'instructor') return;
    
    try {
        // Obtener estadísticas
        const [patientsResult, seriesResult, sessionsResult] = await Promise.all([
            window.firebaseService.dbService.users.getAll(),
            window.firebaseService.dbService.therapies.getAll(),
            window.firebaseService.dbService.sessions.getAll()
        ]);
        
        const patients = patientsResult.success ? patientsResult.data.filter(u => u.userType === 'patient') : [];
        const series = seriesResult.success ? seriesResult.data : [];
        const sessions = sessionsResult.success ? sessionsResult.data : [];
        
        const activePatients = patients.filter(p => p.assignedSeries).length;
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <h3>${patients.length}</h3>
                <p>Pacientes Total</p>
            </div>
            <div class="stat-card">
                <h3>${activePatients}</h3>
                <p>Pacientes Activos</p>
            </div>
            <div class="stat-card">
                <h3>${series.length}</h3>
                <p>Series Creadas</p>
            </div>
            <div class="stat-card">
                <h3>${sessions.length}</h3>
                <p>Sesiones Completadas</p>
            </div>
        `;
    } catch (error) {
        console.error('[Dashboard] Error actualizando estadísticas:', error);
    }
}

// Cargar terapias
async function loadTherapies() {
    const therapiesList = document.getElementById('therapiesList');
    if (!therapiesList) return;
    
    therapiesList.innerHTML = '<div class="loading">Cargando terapias...</div>';
    
    try {
        if (userData.userType === 'patient') {
            // Para pacientes, mostrar su serie asignada
            await loadPatientTherapy();
        } else {
            // Para instructores, mostrar todas las series
            await loadInstructorTherapies();
        }
    } catch (error) {
        console.error('[Dashboard] Error cargando terapias:', error);
        therapiesList.innerHTML = '<div class="error-message">Error al cargar las terapias</div>';
    }
}

// Cargar terapia del paciente
async function loadPatientTherapy() {
    const therapiesList = document.getElementById('therapiesList');
    
    if (!userData.assignedSeries) {
        therapiesList.innerHTML = `
            <div class="no-data">
                <p>🔍 No tienes una serie asignada aún.</p>
                <p>Consulta con tu instructor para obtener una serie personalizada.</p>
            </div>
        `;
        return;
    }
    
    try {
        const seriesData = JSON.parse(userData.assignedSeries);
        const therapyType = window.THERAPY_DATA ? window.THERAPY_DATA[seriesData.therapyType] : null;
        const progress = Math.round(((userData.currentSession || 0) / seriesData.totalSessions) * 100);
        
        therapiesList.innerHTML = `
            <div class="therapy-card patient-therapy">
                <div class="therapy-header">
                    <h3>${seriesData.name}</h3>
                    <span class="therapy-type">${therapyType ? therapyType.name : seriesData.therapyType}</span>
                </div>
                
                <div class="therapy-progress">
                    <div class="progress-info">
                        <span>Progreso: ${userData.currentSession || 0}/${seriesData.totalSessions} sesiones</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="therapy-postures">
                    <h4>Posturas de tu serie:</h4>
                    <div class="postures-grid">
                        ${seriesData.postures.map((posture, index) => `
                            <div class="posture-item" onclick="window.dashboardModule.showPostureDetail(${index}, '${seriesData.therapyType}')">
                                <img src="${posture.image}" alt="${posture.name}">
                                <p>${posture.name}</p>
                                <span>${posture.duration} min</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="therapy-actions">
                    ${progress < 100 ? `
                        <button class="btn-primary" onclick="window.dashboardModule.startSession()">
                            🧘‍♀️ Iniciar Sesión ${(userData.currentSession || 0) + 1}
                        </button>
                    ` : `
                        <div class="series-completed">
                            <h4>🎉 ¡Serie Completada!</h4>
                            <p>Has completado toda tu serie. Contacta a tu instructor para una nueva.</p>
                        </div>
                    `}
                    <button class="btn-secondary" onclick="window.dashboardModule.viewSessionHistory()">
                        📊 Ver Historial
                    </button>
                </div>
            </div>
        `;
        
        // Guardar datos de la serie actual
        window.currentPatientSeries = seriesData;
    } catch (error) {
        console.error('[Dashboard] Error parseando serie del paciente:', error);
        therapiesList.innerHTML = '<div class="error-message">Error al cargar tu serie</div>';
    }
}

// Cargar terapias del instructor
async function loadInstructorTherapies() {
    const therapiesList = document.getElementById('therapiesList');
    
    const result = await window.firebaseService.dbService.therapies.getAll();
    
    if (result.success && result.data.length > 0) {
        const therapies = result.data;
        
        therapiesList.innerHTML = therapies.map(therapy => {
            const therapyType = window.THERAPY_DATA ? window.THERAPY_DATA[therapy.therapyType] : null;
            
            return `
                <div class="therapy-card">
                    <div class="therapy-header">
                        <h3>${therapy.name}</h3>
                        <span class="therapy-type">${therapyType ? therapyType.name : therapy.therapyType}</span>
                    </div>
                    
                    <div class="therapy-meta">
                        <span>📋 ${therapy.postures.length} posturas</span>
                        <span>📅 ${therapy.totalSessions} sesiones</span>
                        <span>⏱️ ${therapy.postures.reduce((sum, p) => sum + p.duration, 0)} min total</span>
                    </div>
                    
                    <div class="therapy-postures-preview">
                        ${therapy.postures.slice(0, 3).map(p => `
                            <img src="${p.image}" alt="${p.name}" title="${p.name}">
                        `).join('')}
                        ${therapy.postures.length > 3 ? `<span>+${therapy.postures.length - 3}</span>` : ''}
                    </div>
                    
                    <div class="therapy-actions">
                        <button class="btn-secondary" onclick="window.dashboardModule.viewTherapyDetails('${therapy.id}')">
                            👁️ Ver Detalles
                        </button>
                        <button class="btn-secondary" onclick="window.dashboardModule.editTherapy('${therapy.id}')">
                            ✏️ Editar
                        </button>
                        <button class="btn-secondary" onclick="window.dashboardModule.duplicateTherapy('${therapy.id}')">
                            📋 Duplicar
                        </button>
                        <button class="btn-danger" onclick="window.dashboardModule.deleteTherapy('${therapy.id}')">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        therapiesList.innerHTML = `
            <div class="no-data">
                <p>No hay series creadas aún.</p>
                <button class="btn-primary" onclick="window.dashboardModule.showCreateTherapyModal()">
                    + Crear Primera Serie
                </button>
            </div>
        `;
    }
}

// Cargar reportes
async function loadReports() {
    const reportsList = document.getElementById('reportsList');
    if (!reportsList) return;
    
    reportsList.innerHTML = '<div class="loading">Cargando reportes...</div>';
    
    try {
        if (userData.userType === 'patient') {
            await loadPatientReports();
        } else {
            await loadInstructorReports();
        }
    } catch (error) {
        console.error('[Dashboard] Error cargando reportes:', error);
        reportsList.innerHTML = '<div class="error-message">Error al cargar los reportes</div>';
    }
}

// Cargar reportes del paciente
async function loadPatientReports() {
    const reportsList = document.getElementById('reportsList');
    
    const result = await window.firebaseService.dbService.sessions.getByUser(currentUser.uid);
    
    if (result.success && result.data.length > 0) {
        const sessions = result.data;
        
        // Calcular estadísticas
        const stats = calculatePatientStats(sessions);
        
        reportsList.innerHTML = `
            <div class="patient-stats">
                <div class="stat-card">
                    <h3>${sessions.length}</h3>
                    <p>Sesiones Completadas</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.avgPainBefore}</h3>
                    <p>Dolor Inicial Promedio</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.avgPainAfter}</h3>
                    <p>Dolor Final Promedio</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.avgImprovement > 0 ? '-' : '+'}${Math.abs(stats.avgImprovement)}</h3>
                    <p>Mejora Promedio</p>
                </div>
            </div>
            
            <div class="pain-chart-container">
                <h3>Evolución del Dolor</h3>
                <canvas id="painChart"></canvas>
            </div>
            
            <div class="sessions-history">
                <h3>Historial de Sesiones</h3>
                ${renderSessionsHistory(sessions)}
            </div>
        `;
        
        // Renderizar gráfico
        renderPainChart(sessions);
    } else {
        reportsList.innerHTML = '<div class="no-data">No tienes sesiones registradas aún</div>';
    }
}

// Cargar reportes del instructor
async function loadInstructorReports() {
    const reportsList = document.getElementById('reportsList');
    
    // Generar reporte general
    const [patientsResult, sessionsResult] = await Promise.all([
        window.firebaseService.dbService.users.getAll(),
        window.firebaseService.dbService.sessions.getAll()
    ]);
    
    const patients = patientsResult.success ? patientsResult.data.filter(u => u.userType === 'patient') : [];
    const sessions = sessionsResult.success ? sessionsResult.data : [];
    
    reportsList.innerHTML = `
        <div class="report-actions">
            <button class="btn-primary" onclick="window.dashboardModule.generateDetailedReport()">
                📄 Generar Reporte Detallado
            </button>
            <button class="btn-secondary" onclick="window.dashboardModule.exportReports()">
                💾 Exportar Datos
            </button>
        </div>
        
        <div class="reports-summary">
            <h3>Resumen General</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <span>Total Pacientes:</span>
                    <strong>${patients.length}</strong>
                </div>
                <div class="summary-item">
                    <span>Sesiones Totales:</span>
                    <strong>${sessions.length}</strong>
                </div>
                <div class="summary-item">
                    <span>Promedio Sesiones/Paciente:</span>
                    <strong>${patients.length > 0 ? (sessions.length / patients.length).toFixed(1) : 0}</strong>
                </div>
            </div>
        </div>
        
        <div class="patient-reports">
            <h3>Reportes por Paciente</h3>
            ${renderPatientReports(patients, sessions)}
        </div>
    `;
}

// Cargar usuarios
async function loadUsers() {
    if (userData.userType !== 'instructor') return;
    
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    usersList.innerHTML = '<div class="loading">Cargando usuarios...</div>';
    
    try {
        const result = await window.firebaseService.dbService.users.getAll();
        
        if (result.success && result.data.length > 0) {
            const patients = result.data.filter(user => user.userType === 'patient');
            
            usersList.innerHTML = patients.map(patient => {
                const hasAssignedSeries = patient.assignedSeries ? true : false;
                let seriesInfo = null;
                let progress = 0;
                
                if (hasAssignedSeries) {
                    try {
                        seriesInfo = JSON.parse(patient.assignedSeries);
                        progress = Math.round(((patient.currentSession || 0) / seriesInfo.totalSessions) * 100);
                    } catch (e) {}
                }
                
                return `
                    <div class="user-card ${hasAssignedSeries ? 'has-series' : 'no-series'}">
                        <div class="user-avatar">${patient.name ? patient.name.charAt(0).toUpperCase() : 'U'}</div>
                        <h4>${patient.name || 'Usuario'}</h4>
                        <p class="user-email">${patient.email}</p>
                        ${patient.age ? `<p class="user-age">Edad: ${patient.age} años</p>` : ''}
                        
                        <div class="user-status">
                            <span class="status-badge ${patient.isActive ? 'active' : 'inactive'}">
                                ${patient.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        
                        ${hasAssignedSeries && seriesInfo ? `
                            <div class="user-series-info">
                                <p><strong>Serie:</strong> ${seriesInfo.name}</p>
                                <div class="mini-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${progress}%"></div>
                                    </div>
                                    <span>${progress}%</span>
                                </div>
                            </div>
                        ` : `
                            <div class="no-series-alert">
                                <p>⚠️ Sin serie asignada</p>
                            </div>
                        `}
                        
                        <div class="user-actions">
                            <button class="btn-primary btn-small" onclick="window.dashboardModule.assignSeriesToPatient('${patient.id}')">
                                📋 ${hasAssignedSeries ? 'Cambiar' : 'Asignar'} Serie
                            </button>
                            <button class="btn-secondary btn-small" onclick="window.dashboardModule.viewPatientDetails('${patient.id}')">
                                👁️ Ver Detalles
                            </button>
                            <button class="btn-secondary btn-small" onclick="window.dashboardModule.editPatient('${patient.id}')">
                                ✏️ Editar
                            </button>
                            <button class="btn-danger btn-small" onclick="window.dashboardModule.deletePatient('${patient.id}')">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            if (patients.length === 0) {
                usersList.innerHTML = '<div class="no-data">No hay pacientes registrados</div>';
            }
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
                        <div class="profile-info">
                            <h3>${userData.name || 'Usuario'}</h3>
                            <p>${userData.email}</p>
                        </div>
                    </div>
                    
                    <div class="profile-details">
                        <div class="detail-item">
                            <span class="label">Tipo de Usuario:</span>
                            <span class="value">${userData.userType === 'instructor' ? 'Instructor' : 'Paciente'}</span>
                        </div>
                        ${userData.age ? `
                            <div class="detail-item">
                                <span class="label">Edad:</span>
                                <span class="value">${userData.age} años</span>
                            </div>
                        ` : ''}
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
                        <button class="btn-primary" onclick="window.dashboardModule.editProfile()">
                            ✏️ Editar Perfil
                        </button>
                        <button class="btn-secondary" onclick="window.dashboardModule.changePassword()">
                            🔒 Cambiar Contraseña
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

// ===== FUNCIONES DE MODALES Y ACCIONES =====

// Mostrar modal de crear terapia
function showCreateTherapyModal() {
    // Crear modal si no existe
    let modal = document.getElementById('createTherapyModal');
    if (!modal) {
        modal = createTherapyModal();
        document.body.appendChild(modal);
    }
    
    modal.classList.remove('hidden');
    initializeTherapyForm();
}

// Crear modal de terapia
function createTherapyModal() {
    const modal = document.createElement('div');
    modal.id = 'createTherapyModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>Crear Nueva Serie Terapéutica</h3>
                <button class="modal-close" onclick="window.dashboardModule.closeModal('createTherapyModal')">&times;</button>
            </div>
            
            <form id="createTherapyForm" class="therapy-form">
                <div class="form-group">
                    <label for="therapyName">Nombre de la Serie</label>
                    <input type="text" id="therapyName" class="form-input" required>
                </div>
                
                <div class="form-group">
                    <label for="therapyType">Tipo de Terapia</label>
                    <select id="therapyType" class="form-select" required>
                        <option value="">Selecciona un tipo</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="totalSessions">Número de Sesiones</label>
                    <input type="number" id="totalSessions" class="form-input" value="10" min="1" max="30" required>
                </div>
                
                <div class="postures-section">
                    <h4>Selecciona las Posturas</h4>
                    <div id="availablePostures" class="postures-grid"></div>
                </div>
                
                <div class="selected-postures-section">
                    <h4>Posturas Seleccionadas (Arrastra para reordenar)</h4>
                    <div id="selectedPostures" class="selected-postures-list">
                        <p class="no-postures">No hay posturas seleccionadas</p>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="window.dashboardModule.closeModal('createTherapyModal')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary">
                        Crear Serie
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Configurar evento submit
    modal.querySelector('#createTherapyForm').addEventListener('submit', handleCreateTherapy);
    
    return modal;
}

// Inicializar formulario de terapia
function initializeTherapyForm() {
    const therapyTypeSelect = document.getElementById('therapyType');
    
    // Llenar tipos de terapia
    if (window.THERAPY_DATA) {
        therapyTypeSelect.innerHTML = '<option value="">Selecciona un tipo</option>';
        Object.entries(window.THERAPY_DATA).forEach(([key, therapy]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = therapy.name;
            therapyTypeSelect.appendChild(option);
        });
    }
    
    // Evento de cambio de tipo
    therapyTypeSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            loadPosturesForType(e.target.value);
        }
    });
}

// Cargar posturas para un tipo
function loadPosturesForType(type) {
    const container = document.getElementById('availablePostures');
    const therapy = window.THERAPY_DATA[type];
    
    if (!therapy) return;
    
    container.innerHTML = therapy.postures.map(posture => `
        <div class="posture-card" data-posture-id="${posture.id}">
            <img src="${posture.image}" alt="${posture.name}">
            <h5>${posture.name}</h5>
            <p class="sanskrit">${posture.sanskrit}</p>
            <button type="button" class="btn-add-posture" onclick="window.dashboardModule.togglePosture(${posture.id}, '${type}')">
                + Agregar
            </button>
        </div>
    `).join('');
}

// Toggle postura
function togglePosture(postureId, therapyType) {
    const therapy = window.THERAPY_DATA[therapyType];
    const posture = therapy.postures.find(p => p.id === postureId);
    
    if (!posture) return;
    
    const selectedContainer = document.getElementById('selectedPostures');
    const existingItem = selectedContainer.querySelector(`[data-posture-id="${postureId}"]`);
    
    if (existingItem) {
        // Remover
        existingItem.remove();
        
        // Actualizar botón
        const btn = document.querySelector(`.posture-card[data-posture-id="${postureId}"] .btn-add-posture`);
        if (btn) {
            btn.textContent = '+ Agregar';
            btn.classList.remove('selected');
        }
    } else {
        // Agregar
        const noPosturesMsg = selectedContainer.querySelector('.no-postures');
        if (noPosturesMsg) {
            noPosturesMsg.remove();
        }
        
        const postureItem = document.createElement('div');
        postureItem.className = 'selected-posture-item';
        postureItem.draggable = true;
        postureItem.dataset.postureId = postureId;
        postureItem.innerHTML = `
            <span class="drag-handle">≡</span>
            <img src="${posture.image}" alt="${posture.name}">
            <div class="posture-info">
                <h5>${posture.name}</h5>
                <p>${posture.sanskrit}</p>
            </div>
            <div class="duration-control">
                <label>Duración:</label>
                <input type="number" value="${posture.defaultDuration || 5}" min="1" max="30" class="duration-input"> min
            </div>
            <button type="button" class="btn-remove" onclick="window.dashboardModule.removePosture(${postureId}, '${therapyType}')">
                ×
            </button>
        `;
        
        selectedContainer.appendChild(postureItem);
        
        // Actualizar botón
        const btn = document.querySelector(`.posture-card[data-posture-id="${postureId}"] .btn-add-posture`);
        if (btn) {
            btn.textContent = '✓ Agregada';
            btn.classList.add('selected');
        }
        
        // Configurar drag & drop
        setupPostureDragAndDrop();
    }
}

// Remover postura
function removePosture(postureId, therapyType) {
    togglePosture(postureId, therapyType);
}

// Configurar drag & drop para posturas
function setupPostureDragAndDrop() {
    const container = document.getElementById('selectedPostures');
    const items = container.querySelectorAll('.selected-posture-item');
    
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
    });
}

// Manejadores de drag & drop
function handleDragStart(e) {
    draggedElement = e.target.closest('.selected-posture-item');
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    const afterElement = getDragAfterElement(e.currentTarget.parentElement, e.clientY);
    if (afterElement == null) {
        e.currentTarget.parentElement.appendChild(draggedElement);
    } else {
        e.currentTarget.parentElement.insertBefore(draggedElement, afterElement);
    }
}

function handleDrop(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.target.closest('.selected-posture-item')?.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.closest('.selected-posture-item')?.classList.remove('drag-over');
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.selected-posture-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Manejar creación de terapia
async function handleCreateTherapy(e) {
    e.preventDefault();
    
    const name = document.getElementById('therapyName').value;
    const therapyType = document.getElementById('therapyType').value;
    const totalSessions = parseInt(document.getElementById('totalSessions').value);
    
    // Obtener posturas seleccionadas
    const selectedPostures = [];
    const selectedItems = document.querySelectorAll('#selectedPostures .selected-posture-item');
    
    selectedItems.forEach(item => {
        const postureId = parseInt(item.dataset.postureId);
        const duration = parseInt(item.querySelector('.duration-input').value);
        const therapy = window.THERAPY_DATA[therapyType];
        const posture = therapy.postures.find(p => p.id === postureId);
        
        if (posture) {
            selectedPostures.push({
                ...posture,
                duration
            });
        }
    });
    
    if (selectedPostures.length === 0) {
        showError('Selecciona al menos una postura');
        return;
    }
    
    try {
        const therapyData = {
            name,
            therapyType,
            totalSessions,
            postures: selectedPostures,
            createdBy: currentUser.uid,
            createdAt: new Date().toISOString()
        };
        
        const result = await window.firebaseService.dbService.therapies.create(therapyData);
        
        if (result.success) {
            showSuccess('Serie creada exitosamente');
            closeModal('createTherapyModal');
            loadTherapies();
        } else {
            showError('Error al crear la serie');
        }
    } catch (error) {
        console.error('[Dashboard] Error creando serie:', error);
        showError('Error al crear la serie');
    }
}

// Mostrar modal de agregar usuario
function showAddUserModal() {
    showNotification({
        type: 'info',
        title: 'Agregar Usuario',
        message: 'Los nuevos usuarios deben registrarse desde la página de login',
        duration: 5000
    });
}

// Asignar serie a paciente
async function assignSeriesToPatient(patientId) {
    // Crear modal de asignación
    let modal = document.getElementById('assignSeriesModal');
    if (!modal) {
        modal = createAssignSeriesModal();
        document.body.appendChild(modal);
    }
    
    // Guardar ID del paciente
    modal.dataset.patientId = patientId;
    
    // Cargar series disponibles
    const result = await window.firebaseService.dbService.therapies.getAll();
    const seriesSelect = modal.querySelector('#seriesSelect');
    
    if (result.success && result.data.length > 0) {
        seriesSelect.innerHTML = '<option value="">Selecciona una serie</option>';
        result.data.forEach(series => {
            const option = document.createElement('option');
            option.value = series.id;
            option.textContent = `${series.name} (${series.postures.length} posturas, ${series.totalSessions} sesiones)`;
            seriesSelect.appendChild(option);
        });
    } else {
        seriesSelect.innerHTML = '<option value="">No hay series disponibles</option>';
    }
    
    modal.classList.remove('hidden');
}

// Crear modal de asignar serie
function createAssignSeriesModal() {
    const modal = document.createElement('div');
    modal.id = 'assignSeriesModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Asignar Serie Terapéutica</h3>
                <button class="modal-close" onclick="window.dashboardModule.closeModal('assignSeriesModal')">&times;</button>
            </div>
            
            <form id="assignSeriesForm">
                <div class="form-group">
                    <label for="seriesSelect">Serie Terapéutica</label>
                    <select id="seriesSelect" class="form-select" required>
                        <option value="">Cargando series...</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="window.dashboardModule.closeModal('assignSeriesModal')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary">
                        Asignar Serie
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Configurar evento submit
    modal.querySelector('#assignSeriesForm').addEventListener('submit', handleAssignSeries);
    
    return modal;
}

// Manejar asignación de serie
async function handleAssignSeries(e) {
    e.preventDefault();
    
    const modal = document.getElementById('assignSeriesModal');
    const patientId = modal.dataset.patientId;
    const seriesId = document.getElementById('seriesSelect').value;
    
    if (!seriesId) {
        showError('Selecciona una serie');
        return;
    }
    
    try {
        // Obtener datos de la serie
        const seriesResult = await window.firebaseService.dbService.therapies.get(seriesId);
        if (!seriesResult.success) {
            showError('Error al obtener la serie');
            return;
        }
        
        const seriesData = {
            id: seriesId,
            ...seriesResult.data
        };
        
        // Actualizar paciente
        const updateResult = await window.firebaseService.dbService.users.update(patientId, {
            assignedSeries: JSON.stringify(seriesData),
            currentSession: 0,
            seriesAssignedAt: new Date().toISOString()
        });
        
        if (updateResult.success) {
            showSuccess('Serie asignada exitosamente');
            closeModal('assignSeriesModal');
            loadUsers();
            
            // Mostrar notificación
            showNotification({
                type: 'success',
                title: '✅ Serie Asignada',
                message: `La serie "${seriesData.name}" ha sido asignada al paciente`,
                duration: 5000
            });
        } else {
            showError('Error al asignar la serie');
        }
    } catch (error) {
        console.error('[Dashboard] Error asignando serie:', error);
        showError('Error al asignar la serie');
    }
}

// Ver detalles del paciente
async function viewPatientDetails(patientId) {
    const result = await window.firebaseService.dbService.users.get(patientId);
    
    if (!result.success) {
        showError('Error al cargar los datos del paciente');
        return;
    }
    
    const patient = result.data;
    
    // Crear modal de detalles
    let modal = document.getElementById('patientDetailsModal');
    if (!modal) {
        modal = createPatientDetailsModal();
        document.body.appendChild(modal);
    }
    
    // Cargar sesiones del paciente
    const sessionsResult = await window.firebaseService.dbService.sessions.getByUser(patientId);
    const sessions = sessionsResult.success ? sessionsResult.data : [];
    
    // Renderizar contenido
    const content = modal.querySelector('.patient-details-content');
    content.innerHTML = renderPatientDetailsContent(patient, sessions);
    
    modal.classList.remove('hidden');
}

// Crear modal de detalles del paciente
function createPatientDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'patientDetailsModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>Detalles del Paciente</h3>
                <button class="modal-close" onclick="window.dashboardModule.closeModal('patientDetailsModal')">&times;</button>
            </div>
            
            <div class="patient-details-content">
                <!-- Contenido dinámico -->
            </div>
        </div>
    `;
    
    return modal;
}

// Renderizar contenido de detalles del paciente
function renderPatientDetailsContent(patient, sessions) {
    let seriesInfo = null;
    let progress = 0;
    
    if (patient.assignedSeries) {
        try {
            seriesInfo = JSON.parse(patient.assignedSeries);
            progress = Math.round(((patient.currentSession || 0) / seriesInfo.totalSessions) * 100);
        } catch (e) {}
    }
    
    const stats = calculatePatientStats(sessions);
    
    return `
        <div class="patient-details-header">
            <div class="patient-avatar large">${patient.name ? patient.name.charAt(0).toUpperCase() : 'U'}</div>
            <div class="patient-info">
                <h2>${patient.name}</h2>
                <p>${patient.email}</p>
                ${patient.age ? `<p>Edad: ${patient.age} años</p>` : ''}
                <p>Registrado: ${new Date(patient.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
        
        ${seriesInfo ? `
            <div class="patient-series-details">
                <h3>Serie Asignada</h3>
                <div class="series-info-card">
                    <h4>${seriesInfo.name}</h4>
                    <div class="progress-container">
                        <div class="progress-info">
                            <span>Progreso: ${patient.currentSession || 0}/${seriesInfo.totalSessions} sesiones</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        ` : `
            <div class="no-series-info">
                <p>⚠️ Este paciente no tiene una serie asignada</p>
            </div>
        `}
        
        <div class="patient-stats-section">
            <h3>Estadísticas de Sesiones</h3>
            ${sessions.length > 0 ? `
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Total Sesiones</span>
                        <span class="stat-value">${sessions.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Dolor Inicial Promedio</span>
                        <span class="stat-value">${stats.avgPainBefore}/10</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Dolor Final Promedio</span>
                        <span class="stat-value">${stats.avgPainAfter}/10</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Mejora Promedio</span>
                        <span class="stat-value ${stats.avgImprovement >= 0 ? 'positive' : 'negative'}">
                            ${stats.avgImprovement >= 0 ? '-' : '+'}${Math.abs(stats.avgImprovement)}
                        </span>
                    </div>
                </div>
                
                <div class="sessions-timeline">
                    <h4>Historial de Sesiones</h4>
                    ${renderPatientSessionsTimeline(sessions)}
                </div>
            ` : '<p class="no-data">No hay sesiones registradas</p>'}
        </div>
    `;
}

// Renderizar timeline de sesiones del paciente
function renderPatientSessionsTimeline(sessions) {
    return sessions.slice(0, 10).map(session => {
        const improvement = (session.painBefore || 0) - (session.painAfter || 0);
        const improvementClass = improvement > 0 ? 'positive' : improvement < 0 ? 'negative' : 'neutral';
        
        return `
            <div class="session-timeline-item">
                <div class="session-date">${new Date(session.completedAt).toLocaleDateString()}</div>
                <div class="session-data">
                    <span>Dolor: ${session.painBefore} → ${session.painAfter}</span>
                    <span class="improvement ${improvementClass}">
                        ${improvement > 0 ? '-' : improvement < 0 ? '+' : ''}${Math.abs(improvement)}
                    </span>
                </div>
                ${session.comments ? `<p class="session-comment">"${session.comments}"</p>` : ''}
            </div>
        `;
    }).join('');
}

// Editar paciente
async function editPatient(patientId) {
    const result = await window.firebaseService.dbService.users.get(patientId);
    
    if (!result.success) {
        showError('Error al cargar los datos del paciente');
        return;
    }
    
    const patient = result.data;
    
    // Crear modal de edición
    let modal = document.getElementById('editPatientModal');
    if (!modal) {
        modal = createEditPatientModal();
        document.body.appendChild(modal);
    }
    
    // Llenar formulario
    modal.dataset.patientId = patientId;
    document.getElementById('editPatientName').value = patient.name || '';
    document.getElementById('editPatientEmail').value = patient.email || '';
    document.getElementById('editPatientAge').value = patient.age || '';
    document.getElementById('editPatientActive').checked = patient.isActive !== false;
    
    modal.classList.remove('hidden');
}

// Crear modal de editar paciente
function createEditPatientModal() {
    const modal = document.createElement('div');
    modal.id = 'editPatientModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Editar Paciente</h3>
                <button class="modal-close" onclick="window.dashboardModule.closeModal('editPatientModal')">&times;</button>
            </div>
            
            <form id="editPatientForm">
                <div class="form-group">
                    <label for="editPatientName">Nombre</label>
                    <input type="text" id="editPatientName" class="form-input" required>
                </div>
                
                <div class="form-group">
                    <label for="editPatientEmail">Email</label>
                    <input type="email" id="editPatientEmail" class="form-input" readonly>
                </div>
                
                <div class="form-group">
                    <label for="editPatientAge">Edad</label>
                    <input type="number" id="editPatientAge" class="form-input" min="10" max="100">
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="editPatientActive">
                        Paciente Activo
                    </label>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="window.dashboardModule.closeModal('editPatientModal')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Configurar evento submit
    modal.querySelector('#editPatientForm').addEventListener('submit', handleEditPatient);
    
    return modal;
}

// Manejar edición de paciente
async function handleEditPatient(e) {
    e.preventDefault();
    
    const modal = document.getElementById('editPatientModal');
    const patientId = modal.dataset.patientId;
    
    const updateData = {
        name: document.getElementById('editPatientName').value,
        age: parseInt(document.getElementById('editPatientAge').value) || null,
        isActive: document.getElementById('editPatientActive').checked
    };
    
    try {
        const result = await window.firebaseService.dbService.users.update(patientId, updateData);
        
        if (result.success) {
            showSuccess('Paciente actualizado exitosamente');
            closeModal('editPatientModal');
            loadUsers();
        } else {
            showError('Error al actualizar el paciente');
        }
    } catch (error) {
        console.error('[Dashboard] Error actualizando paciente:', error);
        showError('Error al actualizar el paciente');
    }
}

// Eliminar paciente
async function deletePatient(patientId) {
    const confirmed = await showConfirmDialog({
        title: '¿Eliminar Paciente?',
        message: 'Esta acción no se puede deshacer. Se eliminarán todos los datos del paciente.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
    });
    
    if (!confirmed) return;
    
    try {
        const result = await window.firebaseService.dbService.users.delete(patientId);
        
        if (result.success) {
            showSuccess('Paciente eliminado exitosamente');
            loadUsers();
            
            showNotification({
                type: 'info',
                title: 'Paciente Eliminado',
                message: 'El paciente y todos sus datos han sido eliminados del sistema',
                duration: 5000
            });
        } else {
            showError('Error al eliminar el paciente');
        }
    } catch (error) {
        console.error('[Dashboard] Error eliminando paciente:', error);
        showError('Error al eliminar el paciente');
    }
}

// ===== FUNCIONES DE SESIÓN (PACIENTE) =====

// Iniciar sesión de yoga
async function startSession() {
    if (!window.currentPatientSeries) {
        showError('No hay serie asignada');
        return;
    }
    
    // Crear modal de sesión
    let modal = document.getElementById('sessionModal');
    if (!modal) {
        modal = createSessionModal();
        document.body.appendChild(modal);
    }
    
    // Inicializar sesión
    initializeSession();
    modal.classList.remove('hidden');
}

// Crear modal de sesión
function createSessionModal() {
    const modal = document.createElement('div');
    modal.id = 'sessionModal';
    modal.className = 'modal fullscreen';
    
    modal.innerHTML = `
        <div class="modal-content session-container">
            <div class="session-header">
                <h2>Sesión ${(userData.currentSession || 0) + 1}</h2>
                <button class="btn-close-session" onclick="window.dashboardModule.confirmExitSession()">
                    × Salir
                </button>
            </div>
            
            <div id="sessionContent" class="session-content">
                <!-- Contenido dinámico de la sesión -->
            </div>
        </div>
    `;
    
    return modal;
}

// Inicializar sesión
function initializeSession() {
    const sessionNumber = (userData.currentSession || 0) + 1;
    const series = window.currentPatientSeries;
    
    // Estado de la sesión
    window.currentSession = {
        number: sessionNumber,
        postures: series.postures,
        currentPostureIndex: -1,
        startTime: new Date(),
        painBefore: null,
        painAfter: null,
        comments: '',
        postureTimers: []
    };
    
    // Mostrar pantalla de inicio
    showSessionStart();
}

// Mostrar inicio de sesión
function showSessionStart() {
    const content = document.getElementById('sessionContent');
    
    content.innerHTML = `
        <div class="session-start">
            <h3>Antes de comenzar</h3>
            <p>Por favor, evalúa tu nivel de dolor actual</p>
            
            <div class="pain-scale">
                <label>Nivel de dolor (0-10):</label>
                <input type="range" id="painBefore" min="0" max="10" value="5" class="pain-slider">
                <div class="pain-value" id="painBeforeValue">5</div>
            </div>
            
            <div class="pain-descriptions">
                <span class="pain-low">Sin dolor</span>
                <span class="pain-high">Dolor máximo</span>
            </div>
            
            <button class="btn-primary btn-large" onclick="window.dashboardModule.startPostures()">
                Comenzar Sesión
            </button>
        </div>
    `;
    
    // Configurar slider
    const slider = document.getElementById('painBefore');
    const valueDisplay = document.getElementById('painBeforeValue');
    
    slider.addEventListener('input', (e) => {
        valueDisplay.textContent = e.target.value;
    });
}

// Comenzar posturas
function startPostures() {
    window.currentSession.painBefore = parseInt(document.getElementById('painBefore').value);
    window.currentSession.currentPostureIndex = 0;
    
    showCurrentPosture();
}

// Mostrar postura actual
function showCurrentPosture() {
    const session = window.currentSession;
    const posture = session.postures[session.currentPostureIndex];
    const isLastPosture = session.currentPostureIndex === session.postures.length - 1;
    
    const content = document.getElementById('sessionContent');
    
    content.innerHTML = `
        <div class="posture-display">
            <div class="posture-progress">
                <span>Postura ${session.currentPostureIndex + 1} de ${session.postures.length}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((session.currentPostureIndex + 1) / session.postures.length) * 100}%"></div>
                </div>
            </div>
            
            <div class="posture-main">
                <h3>${posture.name}</h3>
                <p class="sanskrit">${posture.sanskrit}</p>
                
                <div class="posture-media">
                    <img src="${posture.image}" alt="${posture.name}">
                    ${posture.videoUrl ? `
                        <button class="btn-watch-video" onclick="window.dashboardModule.showPostureVideo('${posture.videoUrl}')">
                            🎥 Ver Video
                        </button>
                    ` : ''}
                </div>
                
                <div class="posture-timer">
                    <div class="timer-display" id="postureTimer">
                        ${posture.duration}:00
                    </div>
                    <div class="timer-controls">
                        <button class="btn-timer" onclick="window.dashboardModule.startTimer(${posture.duration})">
                            ▶️ Iniciar
                        </button>
                        <button class="btn-timer" onclick="window.dashboardModule.pauseTimer()">
                            ⏸️ Pausar
                        </button>
                    </div>
                </div>
                
                <div class="posture-details">
                    <div class="detail-section">
                        <h4>Instrucciones</h4>
                        <p>${posture.instructions}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Beneficios</h4>
                        <p>${posture.benefits}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Modificaciones</h4>
                        <p>${posture.modifications}</p>
                    </div>
                </div>
            </div>
            
            <div class="posture-navigation">
                <button class="btn-secondary" ${session.currentPostureIndex === 0 ? 'disabled' : ''} 
                        onclick="window.dashboardModule.previousPosture()">
                    ← Anterior
                </button>
                <button class="btn-primary" onclick="window.dashboardModule.nextPosture()">
                    ${isLastPosture ? 'Finalizar Sesión' : 'Siguiente →'}
                </button>
            </div>
        </div>
    `;
}

// Timer de postura
let postureTimer = null;
let timerSeconds = 0;
let timerPaused = false;

function startTimer(minutes) {
    if (postureTimer) {
        clearInterval(postureTimer);
    }
    
    timerSeconds = minutes * 60;
    timerPaused = false;
    
    updateTimerDisplay();
    
    postureTimer = setInterval(() => {
        if (!timerPaused && timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
            
            if (timerSeconds === 0) {
                clearInterval(postureTimer);
                playCompletionSound();
                showNotification({
                    type: 'success',
                    title: '✅ Postura Completada',
                    message: 'Es hora de pasar a la siguiente postura',
                    duration: 5000
                });
            }
        }
    }, 1000);
}

function pauseTimer() {
    timerPaused = !timerPaused;
}

function updateTimerDisplay() {
    const display = document.getElementById('postureTimer');
    if (display) {
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function playCompletionSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N+RQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDuS1e/LeSsFJHfH8N2QQAoUXrTp66hVFA==');
    audio.play().catch(e => console.log('No se pudo reproducir el sonido'));
}

// Mostrar video de postura
function showPostureVideo(videoUrl) {
    const videoId = window.getYouTubeVideoId(videoUrl);
    if (!videoId) return;
    
    // Crear modal de video
    let modal = document.getElementById('videoModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'videoModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content video-container">
                <div class="modal-header">
                    <h3>Video de la Postura</h3>
                    <button class="modal-close" onclick="window.dashboardModule.closeModal('videoModal')">&times;</button>
                </div>
                <div class="video-wrapper">
                    <iframe id="postureVideoFrame" width="100%" height="450" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const iframe = document.getElementById('postureVideoFrame');
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    
    modal.classList.remove('hidden');
}

// Postura anterior
function previousPosture() {
    if (window.currentSession.currentPostureIndex > 0) {
        window.currentSession.currentPostureIndex--;
        showCurrentPosture();
    }
}

// Siguiente postura
function nextPosture() {
    const session = window.currentSession;
    
    if (session.currentPostureIndex < session.postures.length - 1) {
        session.currentPostureIndex++;
        showCurrentPosture();
    } else {
        // Finalizar sesión
        finishSession();
    }
}

// Finalizar sesión
function finishSession() {
    const content = document.getElementById('sessionContent');
    
    content.innerHTML = `
        <div class="session-finish">
            <h3>¡Sesión Completada!</h3>
            <p>Excelente trabajo. Ahora evaluemos cómo te sientes.</p>
            
            <div class="pain-scale">
                <label>Nivel de dolor después de la sesión (0-10):</label>
                <input type="range" id="painAfter" min="0" max="10" value="5" class="pain-slider">
                <div class="pain-value" id="painAfterValue">5</div>
            </div>
            
            <div class="pain-descriptions">
                <span class="pain-low">Sin dolor</span>
                <span class="pain-high">Dolor máximo</span>
            </div>
            
            <div class="form-group">
                <label for="sessionComments">Comentarios sobre la sesión:</label>
                <textarea id="sessionComments" class="form-textarea" rows="4" 
                          placeholder="¿Cómo te sentiste? ¿Alguna observación?"></textarea>
            </div>
            
            <div class="session-summary">
                <h4>Resumen de la Sesión</h4>
                <p>Dolor inicial: ${window.currentSession.painBefore}/10</p>
                <p>Duración: ${calculateSessionDuration()} minutos</p>
                <p>Posturas completadas: ${window.currentSession.postures.length}</p>
            </div>
            
            <button class="btn-primary btn-large" onclick="window.dashboardModule.saveSession()">
                Guardar Sesión
            </button>
        </div>
    `;
    
    // Configurar slider
    const slider = document.getElementById('painAfter');
    const valueDisplay = document.getElementById('painAfterValue');
    
    slider.addEventListener('input', (e) => {
        valueDisplay.textContent = e.target.value;
    });
}

// Calcular duración de la sesión
function calculateSessionDuration() {
    const start = window.currentSession.startTime;
    const end = new Date();
    const duration = Math.round((end - start) / 1000 / 60);
    return duration;
}

// Guardar sesión
async function saveSession() {
    const session = window.currentSession;
    session.painAfter = parseInt(document.getElementById('painAfter').value);
    session.comments = document.getElementById('sessionComments').value;
    
    const sessionData = {
        patientId: currentUser.uid,
        seriesId: window.currentPatientSeries.id,
        sessionNumber: session.number,
        painBefore: session.painBefore,
        painAfter: session.painAfter,
        comments: session.comments,
        duration: calculateSessionDuration(),
        completedAt: new Date().toISOString()
    };
    
    try {
        // Guardar sesión
        const result = await window.firebaseService.dbService.sessions.create(sessionData);
        
        if (result.success) {
            // Actualizar progreso del paciente
            await window.firebaseService.dbService.users.update(currentUser.uid, {
                currentSession: session.number,
                lastSessionAt: new Date().toISOString()
            });
            
            // Actualizar datos locales
            userData.currentSession = session.number;
            
            // Mostrar resumen final
            showSessionComplete();
        } else {
            showError('Error al guardar la sesión');
        }
    } catch (error) {
        console.error('[Dashboard] Error guardando sesión:', error);
        showError('Error al guardar la sesión');
    }
}

// Mostrar sesión completada
function showSessionComplete() {
    const improvement = window.currentSession.painBefore - window.currentSession.painAfter;
    const improvementText = improvement > 0 
        ? `¡Excelente! Tu dolor se redujo en ${improvement} puntos.`
        : improvement < 0 
        ? `Tu dolor aumentó en ${Math.abs(improvement)} puntos. Consulta con tu instructor.`
        : 'Tu nivel de dolor se mantuvo igual.';
    
    const content = document.getElementById('sessionContent');
    
    content.innerHTML = `
        <div class="session-complete">
            <div class="success-icon">🎉</div>
            <h2>¡Sesión Guardada!</h2>
            
            <div class="session-results">
                <h3>Resultados de tu Sesión</h3>
                <div class="result-item">
                    <span>Dolor Inicial:</span>
                    <strong>${window.currentSession.painBefore}/10</strong>
                </div>
                <div class="result-item">
                    <span>Dolor Final:</span>
                    <strong>${window.currentSession.painAfter}/10</strong>
                </div>
                <div class="result-item ${improvement > 0 ? 'positive' : improvement < 0 ? 'negative' : ''}">
                    <span>Mejora:</span>
                    <strong>${improvement > 0 ? '-' : improvement < 0 ? '+' : ''}${Math.abs(improvement)}</strong>
                </div>
            </div>
            
            <p class="improvement-message">${improvementText}</p>
            
            <div class="next-session-info">
                <p>Próxima sesión: <strong>Sesión ${(userData.currentSession || 0) + 1}</strong></p>
                <p>Progreso total: <strong>${Math.round(((userData.currentSession || 0) / window.currentPatientSeries.totalSessions) * 100)}%</strong></p>
            </div>
            
            <button class="btn-primary btn-large" onclick="window.dashboardModule.closeModal('sessionModal'); window.dashboardModule.loadTherapies()">
                Finalizar
            </button>
        </div>
    `;
    
    // Mostrar notificación
    showNotification({
        type: 'success',
        title: '✅ Sesión Completada',
        message: improvementText,
        duration: 8000
    });
}

// Confirmar salir de sesión
function confirmExitSession() {
    if (confirm('¿Estás seguro de que quieres salir? El progreso de esta sesión se perderá.')) {
        if (postureTimer) {
            clearInterval(postureTimer);
        }
        closeModal('sessionModal');
    }
}

// Ver historial de sesiones
async function viewSessionHistory() {
    const result = await window.firebaseService.dbService.sessions.getByUser(currentUser.uid);
    
    if (!result.success) {
        showError('Error al cargar el historial');
        return;
    }
    
    // Crear modal de historial
    let modal = document.getElementById('sessionHistoryModal');
    if (!modal) {
        modal = createSessionHistoryModal();
        document.body.appendChild(modal);
    }
    
    // Renderizar historial
    const content = modal.querySelector('.history-content');
    content.innerHTML = renderSessionHistory(result.data);
    
    modal.classList.remove('hidden');
}

// Crear modal de historial
function createSessionHistoryModal() {
    const modal = document.createElement('div');
    modal.id = 'sessionHistoryModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>Historial de Sesiones</h3>
                <button class="modal-close" onclick="window.dashboardModule.closeModal('sessionHistoryModal')">&times;</button>
            </div>
            
            <div class="history-content">
                <!-- Contenido dinámico -->
            </div>
        </div>
    `;
    
    return modal;
}

// Renderizar historial de sesiones
function renderSessionHistory(sessions) {
    if (sessions.length === 0) {
        return '<p class="no-data">No hay sesiones registradas</p>';
    }
    
    return `
        <div class="sessions-table">
            <table>
                <thead>
                    <tr>
                        <th>Sesión</th>
                        <th>Fecha</th>
                        <th>Dolor Antes</th>
                        <th>Dolor Después</th>
                        <th>Mejora</th>
                        <th>Comentarios</th>
                    </tr>
                </thead>
                <tbody>
                    ${sessions.map(session => {
                        const improvement = (session.painBefore || 0) - (session.painAfter || 0);
                        return `
                            <tr>
                                <td>${session.sessionNumber}</td>
                                <td>${new Date(session.completedAt).toLocaleDateString()}</td>
                                <td>${session.painBefore || 0}</td>
                                <td>${session.painAfter || 0}</td>
                                <td class="${improvement > 0 ? 'positive' : improvement < 0 ? 'negative' : ''}">
                                    ${improvement > 0 ? '-' : improvement < 0 ? '+' : ''}${Math.abs(improvement)}
                                </td>
                                <td>${session.comments || '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ===== UTILIDADES Y HELPERS =====

// Calcular estadísticas del paciente
function calculatePatientStats(sessions) {
    if (sessions.length === 0) {
        return {
            avgPainBefore: 0,
            avgPainAfter: 0,
            avgImprovement: 0
        };
    }
    
    const totalBefore = sessions.reduce((sum, s) => sum + (s.painBefore || 0), 0);
    const totalAfter = sessions.reduce((sum, s) => sum + (s.painAfter || 0), 0);
    
    const avgBefore = (totalBefore / sessions.length).toFixed(1);
    const avgAfter = (totalAfter / sessions.length).toFixed(1);
    const avgImprovement = (avgBefore - avgAfter).toFixed(1);
    
    return {
        avgPainBefore: avgBefore,
        avgPainAfter: avgAfter,
        avgImprovement: avgImprovement
    };
}

// Renderizar historial de sesiones
function renderSessionsHistory(sessions) {
    return sessions.map(session => {
        const improvement = (session.painBefore || 0) - (session.painAfter || 0);
        
        return `
            <div class="session-card">
                <div class="session-header">
                    <h4>Sesión ${session.sessionNumber}</h4>
                    <span>${new Date(session.completedAt).toLocaleDateString()}</span>
                </div>
                <div class="session-stats">
                    <div class="stat">
                        <span>Dolor Antes:</span>
                        <strong>${session.painBefore || 0}</strong>
                    </div>
                    <div class="stat">
                        <span>Dolor Después:</span>
                        <strong>${session.painAfter || 0}</strong>
                    </div>
                    <div class="stat ${improvement > 0 ? 'positive' : improvement < 0 ? 'negative' : ''}">
                        <span>Mejora:</span>
                        <strong>${improvement > 0 ? '-' : improvement < 0 ? '+' : ''}${Math.abs(improvement)}</strong>
                    </div>
                </div>
                ${session.comments ? `
                    <div class="session-comments">
                        <p>"${session.comments}"</p>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Renderizar gráfico de dolor
function renderPainChart(sessions) {
    // Aquí se podría integrar una librería de gráficos como Chart.js
    // Por ahora, mostrar un gráfico simple con CSS
    const chartContainer = document.getElementById('painChart');
    if (!chartContainer) return;
    
    const maxSessions = 10;
    const recentSessions = sessions.slice(-maxSessions);
    
    chartContainer.innerHTML = `
        <div class="simple-chart">
            ${recentSessions.map((session, index) => `
                <div class="chart-bar-group">
                    <div class="chart-bars">
                        <div class="bar bar-before" style="height: ${session.painBefore * 10}%" title="Antes: ${session.painBefore}"></div>
                        <div class="bar bar-after" style="height: ${session.painAfter * 10}%" title="Después: ${session.painAfter}"></div>
                    </div>
                    <span class="chart-label">S${session.sessionNumber}</span>
                </div>
            `).join('')}
        </div>
        <div class="chart-legend">
            <span><span class="legend-color before"></span> Antes</span>
            <span><span class="legend-color after"></span> Después</span>
        </div>
    `;
}

// Renderizar reportes de pacientes
function renderPatientReports(patients, sessions) {
    return patients.map(patient => {
        const patientSessions = sessions.filter(s => s.patientId === patient.id);
        const stats = calculatePatientStats(patientSessions);
        
        return `
            <div class="patient-report-card">
                <h4>${patient.name}</h4>
                <div class="report-stats">
                    <span>Sesiones: ${patientSessions.length}</span>
                    <span>Mejora Promedio: ${stats.avgImprovement > 0 ? '-' : '+'}${Math.abs(stats.avgImprovement)}</span>
                </div>
                <button class="btn-secondary btn-small" onclick="window.dashboardModule.generatePatientReport('${patient.id}')">
                    Ver Reporte Completo
                </button>
            </div>
        `;
    }).join('');
}

// Generar reporte detallado
async function generateDetailedReport() {
    showNotification({
        type: 'info',
        title: 'Generando Reporte',
        message: 'El reporte detallado se está generando...',
        duration: 3000
    });
    
    // Aquí se implementaría la generación de un PDF o descarga de reporte
    setTimeout(() => {
        showNotification({
            type: 'success',
            title: '✅ Reporte Generado',
            message: 'El reporte ha sido generado exitosamente',
            duration: 5000
        });
    }, 2000);
}

// Exportar reportes
async function exportReports() {
    try {
        const [patientsResult, sessionsResult] = await Promise.all([
            window.firebaseService.dbService.users.getAll(),
            window.firebaseService.dbService.sessions.getAll()
        ]);
        
        const data = {
            exportDate: new Date().toISOString(),
            patients: patientsResult.data,
            sessions: sessionsResult.data,
            exportedBy: currentUser.email
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `softzen-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess('Datos exportados exitosamente');
    } catch (error) {
        console.error('[Dashboard] Error exportando datos:', error);
        showError('Error al exportar los datos');
    }
}

// Exportar dashboard
async function exportDashboard() {
    await exportReports();
}

// Cerrar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        
        // Limpiar iframes de video
        if (modalId === 'videoModal') {
            const iframe = document.getElementById('postureVideoFrame');
            if (iframe) iframe.src = '';
        }
    }
}

// Mostrar diálogo de confirmación
function showConfirmDialog(options) {
    return new Promise((resolve) => {
        const confirmed = confirm(options.message);
        resolve(confirmed);
    });
}

// Mostrar notificación
function showNotification(options) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${options.type || 'info'}`;
    
    notification.innerHTML = `
        <div class="notification-content">
            ${options.title ? `<h4>${options.title}</h4>` : ''}
            <p>${options.message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto cerrar
    if (options.duration) {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, options.duration);
    }
}

// Utilidades de UI reutilizadas
function showError(message) {
    showNotification({
        type: 'error',
        title: '❌ Error',
        message: message,
        duration: 5000
    });
}

function showSuccess(message) {
    showNotification({
        type: 'success',
        title: '✅ Éxito',
        message: message,
        duration: 3000
    });
}

// Actualizaciones periódicas
function startPeriodicUpdates() {
    // Actualizar dashboard cada 5 minutos si es instructor
    if (userData.userType === 'instructor') {
        setInterval(() => {
            if (currentSection === 'dashboard') {
                updateFullDashboard();
            }
            updateDashboardStats();
        }, 5 * 60 * 1000);
    }
}

// Hacer funciones disponibles globalmente
window.dashboardModule = {
    // Navegación
    loadSection,
    
    // Terapias
    showCreateTherapyModal,
    viewTherapyDetails: (id) => console.log('Ver detalles de terapia:', id),
    editTherapy: (id) => console.log('Editar terapia:', id),
    duplicateTherapy: (id) => console.log('Duplicar terapia:', id),
    deleteTherapy: (id) => console.log('Eliminar terapia:', id),
    
    // Posturas
    togglePosture,
    removePosture,
    showPostureDetail: (index, type) => {
        const therapy = window.THERAPY_DATA[type];
        const posture = therapy.postures[index];
        showPostureVideo(posture.videoUrl);
    },
    
    // Pacientes
    assignSeriesToPatient,
    viewPatientDetails,
    editPatient,
    deletePatient,
    generatePatientReport: (id) => console.log('Generar reporte de paciente:', id),
    
    // Sesiones
    startSession,
    startPostures,
    startTimer,
    pauseTimer,
    showPostureVideo,
    previousPosture,
    nextPosture,
    saveSession,
    confirmExitSession,
    viewSessionHistory,
    
    // Reportes
    generateDetailedReport,
    exportReports,
    exportDashboard,
    
    // Perfil
    editProfile: () => showNotification({
        type: 'info',
        title: 'Editar Perfil',
        message: 'Esta función estará disponible próximamente',
        duration: 3000
    }),
    changePassword: () => showNotification({
        type: 'info',
        title: 'Cambiar Contraseña',
        message: 'Esta función estará disponible próximamente',
        duration: 3000
    }),
    
    // Utilidades
    closeModal,
    showNotification,
    showError,
    showSuccess
};

// Hacer función global
window.initDashboard = initDashboard;

console.log('🎯 Dashboard Module v2.1 cargado');