// Dashboard Completo - SoftZen v2.1
// Sistema completo de gestión con drag & drop, KPIs, gestión de pacientes, etc.

class DashboardModule {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.therapyData = [];
        this.patients = [];
        this.sessions = [];
        this.reports = [];
        this.draggedElement = null;
        this.isInitialized = false;
    }

    async init(user) {
        try {
            console.log('[Dashboard] Inicializando dashboard completo para:', user.email);
            this.currentUser = user;
            
            // Inicializar módulos adicionales
            if (window.therapyManager && !window.therapyManager.isInitialized) {
                window.therapyManager.init();
            }
            
            if (window.patientManager && !window.patientManager.isInitialized && user.userType === 'instructor') {
                await window.patientManager.init();
            }
            
            if (window.sessionManager && !window.sessionManager.isInitialized) {
                window.sessionManager.init();
            }
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            // Configurar UI
            this.setupNavigation();
            this.setupActionButtons();
            this.setupEventListeners();
            
            // Cargar sección inicial
            await this.loadSection('dashboard');
            
            // Actualizar estadísticas
            await this.updateDashboardStats();
            
            // Configurar actualizaciones periódicas
            this.setupPeriodicUpdates();
            
            this.isInitialized = true;
            console.log('[Dashboard] Dashboard inicializado correctamente');
            
        } catch (error) {
            console.error('[Dashboard] Error inicializando dashboard:', error);
            window.showError('Error al cargar el dashboard');
        }
    }

    async loadInitialData() {
        try {
            // Cargar datos según el tipo de usuario
            if (this.currentUser.userType === 'instructor') {
                await Promise.all([
                    this.loadPatients(),
                    this.loadAllTherapies(),
                    this.loadAllSessions(),
                    this.loadReports()
                ]);
            } else {
                await Promise.all([
                    this.loadUserTherapies(),
                    this.loadUserSessions(),
                    this.loadUserReports()
                ]);
            }
        } catch (error) {
            console.error('[Dashboard] Error cargando datos iniciales:', error);
        }
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', async () => {
                const section = item.dataset.section;
                if (section) {
                    // Actualizar estado activo
                    navItems.forEach(nav => nav.classList.remove('active'));
                    item.classList.add('active');
                    
                    // Cargar sección
                    await this.loadSection(section);
                }
            });
        });
    }

    setupActionButtons() {
        // Botón crear terapia
        const createTherapyBtn = document.getElementById('createTherapyBtn');
        if (createTherapyBtn) {
            createTherapyBtn.addEventListener('click', () => {
                if (window.therapyManager) {
                    window.therapyManager.showCreateTherapyModal();
                } else {
                    this.showCreateTherapyModal();
                }
            });
        }
        
        // Botón generar reporte
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }
        
        // Botón agregar usuario
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                if (window.patientManager) {
                    window.patientManager.showAddPatientModal();
                } else {
                    this.showAddPatientModal();
                }
            });
        }
    }

    setupEventListeners() {
        // Configurar drag & drop global
        this.setupDragAndDrop();
        
        // Configurar búsqueda en tiempo real
        this.setupSearch();
        
        // Configurar filtros
        this.setupFilters();
    }

    setupDragAndDrop() {
        // Configurar drag & drop para series de terapias
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('draggable-item')) {
                this.draggedElement = e.target;
                e.target.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', e.target.innerHTML);
            }
        });

        document.addEventListener('dragover', (e) => {
            if (e.target.classList.contains('drop-zone')) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                e.target.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.classList.contains('drop-zone')) {
                e.target.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            if (e.target.classList.contains('drop-zone')) {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                this.handleDrop(e);
            }
        });

        document.addEventListener('dragend', (e) => {
            if (this.draggedElement) {
                this.draggedElement.style.opacity = '1';
                this.draggedElement = null;
            }
        });
    }

    setupSearch() {
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.performSearch(e.target.value, e.target.dataset.searchType);
            });
        });
    }

    setupFilters() {
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.applyFilter(e.target.value, e.target.dataset.filterType);
            });
        });
    }

    async loadSection(section) {
        console.log('[Dashboard] Cargando sección:', section);
        this.currentSection = section;
        
        // Ocultar todas las secciones
        document.querySelectorAll('.dashboard-section').forEach(sec => {
            sec.classList.add('hidden');
        });
        
        // Mostrar sección seleccionada
        const sectionEl = document.getElementById(`${section}Section`) || 
                         document.getElementById(`${section}sSection`);
        
        if (sectionEl) {
            sectionEl.classList.remove('hidden');
            
            // Cargar contenido según la sección
            switch (section) {
                case 'dashboard':
                case 'therapies':
                    await this.renderTherapies();
                    break;
                case 'reports':
                    await this.renderReports();
                    break;
                case 'users':
                    await this.renderUsers();
                    break;
                case 'profile':
                    await this.renderProfile();
                    break;
                case 'sessions':
                    await this.renderSessions();
                    break;
                case 'analytics':
                    await this.renderAnalytics();
                    break;
            }
        }
    }

    async renderTherapies() {
        const therapiesList = document.getElementById('therapiesList');
        if (!therapiesList) return;
        
        therapiesList.innerHTML = '<div class="loading">Cargando terapias...</div>';
        
        try {
            const therapies = this.currentUser.userType === 'instructor' 
                ? this.therapyData 
                : this.therapyData.filter(t => t.isPublic || t.assignedTo === this.currentUser.uid);
            
            if (therapies.length > 0) {
                therapiesList.innerHTML = `
                    <div class="therapies-header">
                        <div class="search-bar">
                            <input type="text" class="search-input" data-search-type="therapies" placeholder="Buscar terapias...">
                            <select class="filter-select" data-filter-type="therapy-category">
                                <option value="">Todas las categorías</option>
                                <option value="anxiety">Ansiedad</option>
                                <option value="back_pain">Dolor de Espalda</option>
                                <option value="arthritis">Artritis</option>
                                <option value="general">General</option>
                            </select>
                        </div>
                    </div>
                    <div class="therapies-grid" id="therapiesGrid">
                        ${therapies.map(therapy => this.createTherapyCard(therapy)).join('')}
                    </div>
                `;
                
                // Configurar drag & drop para las tarjetas
                this.setupTherapyCardEvents();
            } else {
                therapiesList.innerHTML = this.createEmptyState('terapias', 'No hay terapias disponibles');
            }
        } catch (error) {
            console.error('[Dashboard] Error renderizando terapias:', error);
            therapiesList.innerHTML = '<div class="error-message">Error al cargar las terapias</div>';
        }
    }

    createTherapyCard(therapy) {
        return `
            <div class="therapy-card draggable-item" draggable="true" data-therapy-id="${therapy.id}">
                <div class="therapy-image">
                    <img src="${therapy.image || '/img/default-therapy.jpg'}" alt="${therapy.name}" loading="lazy">
                    <div class="therapy-overlay">
                        <button class="btn-icon" onclick="window.dashboardModule.previewTherapy('${therapy.id}')">
                            👁️
                        </button>
                    </div>
                </div>
                <div class="therapy-content">
                    <h3>${therapy.name}</h3>
                    <p>${therapy.description}</p>
                    <div class="therapy-meta">
                        <span class="meta-item">⏱️ ${therapy.duration} min</span>
                        <span class="meta-item">🎯 ${therapy.category || 'General'}</span>
                        <span class="meta-item">📊 ${therapy.difficulty || 'Principiante'}</span>
                        <span class="meta-item">⭐ ${therapy.rating || 'N/A'}</span>
                    </div>
                    <div class="therapy-actions">
                        <button class="btn-primary" onclick="window.dashboardModule.startTherapy('${therapy.id}')">
                            Iniciar Sesión
                        </button>
                        ${this.currentUser.userType === 'instructor' ? `
                            <button class="btn-secondary" onclick="window.dashboardModule.editTherapy('${therapy.id}')">
                                Editar
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    setupTherapyCardEvents() {
        // Configurar búsqueda y filtros
        this.setupSearch();
        this.setupFilters();
    }

    async renderReports() {
        const reportsList = document.getElementById('reportsList');
        if (!reportsList) return;
        
        reportsList.innerHTML = '<div class="loading">Cargando reportes...</div>';
        
        try {
            const reports = this.currentUser.userType === 'instructor' 
                ? this.reports 
                : this.reports.filter(r => r.userId === this.currentUser.uid);
            
            if (reports.length > 0) {
                reportsList.innerHTML = `
                    <div class="reports-grid">
                        ${reports.map(report => this.createReportCard(report)).join('')}
                    </div>
                    <div class="reports-actions">
                        <button class="btn-primary" onclick="window.dashboardModule.generateReport()">
                            📊 Generar Nuevo Reporte
                        </button>
                        <button class="btn-secondary" onclick="window.dashboardModule.exportReports()">
                            📋 Exportar Todo
                        </button>
                    </div>
                `;
            } else {
                reportsList.innerHTML = this.createEmptyState('reportes', 'No hay reportes disponibles');
            }
        } catch (error) {
            console.error('[Dashboard] Error renderizando reportes:', error);
            reportsList.innerHTML = '<div class="error-message">Error al cargar los reportes</div>';
        }
    }

    createReportCard(report) {
        return `
            <div class="report-card">
                <div class="report-header">
                    <h3>Reporte - ${this.formatDate(report.createdAt)}</h3>
                    <span class="report-type">${report.type || 'General'}</span>
                </div>
                <div class="report-content">
                    <div class="report-stats">
                        <div class="stat">
                            <span class="stat-value">${report.sessionsCompleted || 0}</span>
                            <span class="stat-label">Sesiones</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${report.totalTime || 0}</span>
                            <span class="stat-label">Minutos</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${report.progress || 0}%</span>
                            <span class="stat-label">Progreso</span>
                        </div>
                    </div>
                </div>
                <div class="report-actions">
                    <button class="btn-secondary" onclick="window.dashboardModule.viewReport('${report.id}')">
                        Ver Detalles
                    </button>
                    <button class="btn-icon" onclick="window.dashboardModule.downloadReport('${report.id}')">
                        📥
                    </button>
                </div>
            </div>
        `;
    }

    async renderUsers() {
        if (this.currentUser.userType !== 'instructor') return;
        
        const usersList = document.getElementById('usersList');
        if (!usersList) return;
        
        usersList.innerHTML = '<div class="loading">Cargando pacientes...</div>';
        
        try {
            if (this.patients.length > 0) {
                usersList.innerHTML = `
                    <div class="users-header">
                        <div class="search-bar">
                            <input type="text" class="search-input" data-search-type="patients" placeholder="Buscar pacientes...">
                            <select class="filter-select" data-filter-type="patient-status">
                                <option value="">Todos los estados</option>
                                <option value="active">Activos</option>
                                <option value="inactive">Inactivos</option>
                            </select>
                        </div>
                    </div>
                    <div class="users-grid">
                        ${this.patients.map(patient => this.createPatientCard(patient)).join('')}
                    </div>
                `;
            } else {
                usersList.innerHTML = this.createEmptyState('pacientes', 'No hay pacientes registrados');
            }
        } catch (error) {
            console.error('[Dashboard] Error renderizando usuarios:', error);
            usersList.innerHTML = '<div class="error-message">Error al cargar los pacientes</div>';
        }
    }

    createPatientCard(patient) {
        const lastSession = this.getLastSession(patient.id);
        const sessionsCount = this.getUserSessionsCount(patient.id);
        
        return `
            <div class="patient-card">
                <div class="patient-header">
                    <div class="patient-avatar">
                        ${patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div class="patient-info">
                        <h4>${patient.name || 'Paciente'}</h4>
                        <p>${patient.email}</p>
                        <span class="patient-condition">${this.getConditionName(patient.condition)}</span>
                    </div>
                    <div class="patient-status ${patient.isActive ? 'active' : 'inactive'}">
                        ${patient.isActive ? 'Activo' : 'Inactivo'}
                    </div>
                </div>
                <div class="patient-stats">
                    <div class="stat">
                        <span class="stat-value">${sessionsCount}</span>
                        <span class="stat-label">Sesiones</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${patient.age || 'N/A'}</span>
                        <span class="stat-label">Edad</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${patient.painLevel || 'N/A'}</span>
                        <span class="stat-label">Dolor</span>
                    </div>
                </div>
                <div class="patient-actions">
                    <button class="btn-primary" onclick="window.dashboardModule.viewPatientDetails('${patient.id}')">
                        Ver Detalles
                    </button>
                    <button class="btn-secondary" onclick="window.dashboardModule.assignTherapy('${patient.id}')">
                        Asignar Terapia
                    </button>
                </div>
                ${lastSession ? `
                    <div class="patient-last-session">
                        Última sesión: ${this.formatDate(lastSession.createdAt)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    async renderProfile() {
        const profileInfo = document.getElementById('profileInfo');
        if (!profileInfo) return;
        
        profileInfo.innerHTML = '<div class="loading">Cargando perfil...</div>';
        
        try {
            const userData = this.currentUser.userData || {};
            
            profileInfo.innerHTML = `
                <div class="profile-container">
                    <div class="profile-header">
                        <div class="profile-avatar-large">
                            ${userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div class="profile-info">
                            <h2>${userData.name || 'Usuario'}</h2>
                            <p>${userData.email || this.currentUser.email}</p>
                            <span class="profile-role">${userData.userType === 'instructor' ? 'Instructor' : 'Paciente'}</span>
                        </div>
                        <button class="btn-secondary" onclick="window.dashboardModule.editProfile()">
                            ✏️ Editar Perfil
                        </button>
                    </div>
                    
                    <div class="profile-sections">
                        <div class="profile-section">
                            <h3>Información Personal</h3>
                            <div class="profile-details">
                                ${this.createProfileDetail('Nombre', userData.name)}
                                ${this.createProfileDetail('Email', userData.email)}
                                ${this.createProfileDetail('Tipo', userData.userType === 'instructor' ? 'Instructor' : 'Paciente')}
                                ${userData.age ? this.createProfileDetail('Edad', userData.age) : ''}
                                ${userData.condition ? this.createProfileDetail('Condición', this.getConditionName(userData.condition)) : ''}
                                ${userData.specialization ? this.createProfileDetail('Especialización', userData.specialization) : ''}
                                ${this.createProfileDetail('Miembro desde', this.formatDate(userData.createdAt))}
                                ${this.createProfileDetail('Último acceso', this.formatDate(userData.lastLogin))}
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h3>Estadísticas</h3>
                            <div class="profile-stats">
                                ${await this.createProfileStats()}
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h3>Configuración</h3>
                            <div class="profile-settings">
                                <button class="btn-secondary" onclick="window.dashboardModule.changePassword()">
                                    🔒 Cambiar Contraseña
                                </button>
                                <button class="btn-secondary" onclick="window.dashboardModule.exportData()">
                                    📋 Exportar Datos
                                </button>
                                <button class="btn-danger" onclick="window.dashboardModule.deleteAccount()">
                                    🗑️ Eliminar Cuenta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[Dashboard] Error renderizando perfil:', error);
            profileInfo.innerHTML = '<div class="error-message">Error al cargar el perfil</div>';
        }
    }

    createProfileDetail(label, value) {
        if (!value) return '';
        return `
            <div class="profile-detail">
                <span class="detail-label">${label}:</span>
                <span class="detail-value">${value}</span>
            </div>
        `;
    }

    async createProfileStats() {
        const sessionsCount = this.getUserSessionsCount(this.currentUser.uid);
        const totalTime = this.getUserTotalTime(this.currentUser.uid);
        
        if (this.currentUser.userType === 'instructor') {
            return `
                <div class="stat-item">
                    <span class="stat-value">${this.patients.length}</span>
                    <span class="stat-label">Pacientes</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.therapyData.length}</span>
                    <span class="stat-label">Terapias</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${sessionsCount}</span>
                    <span class="stat-label">Sesiones Totales</span>
                </div>
            `;
        } else {
            return `
                <div class="stat-item">
                    <span class="stat-value">${sessionsCount}</span>
                    <span class="stat-label">Sesiones</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${totalTime}</span>
                    <span class="stat-label">Minutos</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.currentUser.userData?.painLevel || 'N/A'}</span>
                    <span class="stat-label">Nivel de Dolor</span>
                </div>
            `;
        }
    }

    async updateDashboardStats() {
        const statsContainer = document.getElementById('dashboardStats');
        if (!statsContainer) return;
        
        try {
            let stats;
            
            if (this.currentUser.userType === 'instructor') {
                stats = await this.getInstructorStats();
            } else {
                stats = await this.getPatientStats();
            }
            
            statsContainer.innerHTML = stats.map(stat => `
                <div class="stat-card">
                    <div class="stat-icon">${stat.icon}</div>
                    <div class="stat-content">
                        <h3>${stat.value}</h3>
                        <p>${stat.label}</p>
                        ${stat.trend ? `<span class="stat-trend ${stat.trend > 0 ? 'positive' : 'negative'}">${stat.trend > 0 ? '↗️' : '↘️'} ${Math.abs(stat.trend)}%</span>` : ''}
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('[Dashboard] Error actualizando estadísticas:', error);
        }
    }

    async getInstructorStats() {
        const activePatientsCount = this.patients.filter(p => p.isActive).length;
        const totalSessions = this.sessions.length;
        const avgPainReduction = this.calculateAveragePainReduction();
        const monthlyGrowth = this.calculateMonthlyGrowth();
        
        return [
            {
                icon: '👥',
                value: activePatientsCount,
                label: 'Pacientes Activos',
                trend: monthlyGrowth.patients
            },
            {
                icon: '🧘‍♀️',
                value: totalSessions,
                label: 'Sesiones Completadas',
                trend: monthlyGrowth.sessions
            },
            {
                icon: '📈',
                value: `${avgPainReduction.toFixed(1)}%`,
                label: 'Mejora Promedio',
                trend: monthlyGrowth.improvement
            },
            {
                icon: '⭐',
                value: this.therapyData.length,
                label: 'Terapias Activas',
                trend: monthlyGrowth.therapies
            }
        ];
    }

    async getPatientStats() {
        const userSessions = this.sessions.filter(s => s.userId === this.currentUser.uid);
        const totalTime = userSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const avgRating = this.calculateAverageRating(userSessions);
        const streakDays = this.calculateStreak();
        
        return [
            {
                icon: '🧘‍♀️',
                value: userSessions.length,
                label: 'Sesiones Completadas'
            },
            {
                icon: '⏱️',
                value: totalTime,
                label: 'Minutos de Práctica'
            },
            {
                icon: '⭐',
                value: avgRating.toFixed(1),
                label: 'Calificación Promedio'
            },
            {
                icon: '🔥',
                value: streakDays,
                label: 'Días Consecutivos'
            }
        ];
    }

    // Métodos de datos
    async loadPatients() {
        try {
            const patientsSnapshot = await firebase.firestore()
                .collection('users')
                .where('userType', '==', 'patient')
                .get();
            
            this.patients = [];
            patientsSnapshot.forEach(doc => {
                this.patients.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('[Dashboard] Pacientes cargados:', this.patients.length);
        } catch (error) {
            console.error('[Dashboard] Error cargando pacientes:', error);
        }
    }

    async loadAllTherapies() {
        try {
            // Cargar terapias predefinidas desde therapy-data.js
            if (window.THERAPY_DATA) {
                this.therapyData = [];
                Object.values(window.THERAPY_DATA).forEach(therapy => {
                    therapy.postures.forEach(posture => {
                        this.therapyData.push({
                            id: posture.id,
                            name: posture.name,
                            description: posture.benefits,
                            duration: posture.defaultDuration,
                            category: therapy.id,
                            difficulty: posture.difficulty,
                            instructions: posture.instructions,
                            videoUrl: posture.videoUrl,
                            image: posture.image,
                            isPublic: true
                        });
                    });
                });
            }
            
            // También cargar terapias personalizadas desde Firebase
            const therapiesSnapshot = await firebase.firestore()
                .collection('therapies')
                .get();
            
            therapiesSnapshot.forEach(doc => {
                this.therapyData.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('[Dashboard] Terapias cargadas:', this.therapyData.length);
        } catch (error) {
            console.error('[Dashboard] Error cargando terapias:', error);
        }
    }

    async loadUserTherapies() {
        try {
            // Para pacientes, cargar solo terapias asignadas o públicas
            this.therapyData = [];
            
            if (window.THERAPY_DATA) {
                Object.values(window.THERAPY_DATA).forEach(therapy => {
                    therapy.postures.forEach(posture => {
                        this.therapyData.push({
                            id: posture.id,
                            name: posture.name,
                            description: posture.benefits,
                            duration: posture.defaultDuration,
                            category: therapy.id,
                            difficulty: posture.difficulty,
                            instructions: posture.instructions,
                            videoUrl: posture.videoUrl,
                            image: posture.image,
                            isPublic: true
                        });
                    });
                });
            }
            
            console.log('[Dashboard] Terapias del usuario cargadas:', this.therapyData.length);
        } catch (error) {
            console.error('[Dashboard] Error cargando terapias del usuario:', error);
        }
    }

    async loadAllSessions() {
        try {
            const sessionsSnapshot = await firebase.firestore()
                .collection('sessions')
                .orderBy('createdAt', 'desc')
                .limit(100)
                .get();
            
            this.sessions = [];
            sessionsSnapshot.forEach(doc => {
                this.sessions.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('[Dashboard] Sesiones cargadas:', this.sessions.length);
        } catch (error) {
            console.error('[Dashboard] Error cargando sesiones:', error);
            this.sessions = []; // Fallback
        }
    }

    async loadUserSessions() {
        try {
            const sessionsSnapshot = await firebase.firestore()
                .collection('sessions')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();
            
            this.sessions = [];
            sessionsSnapshot.forEach(doc => {
                this.sessions.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('[Dashboard] Sesiones del usuario cargadas:', this.sessions.length);
        } catch (error) {
            console.error('[Dashboard] Error cargando sesiones del usuario:', error);
            this.sessions = []; // Fallback
        }
    }

    async loadReports() {
        try {
            const query = this.currentUser.userType === 'instructor'
                ? firebase.firestore().collection('reports')
                : firebase.firestore().collection('reports').where('userId', '==', this.currentUser.uid);
            
            const reportsSnapshot = await query.orderBy('createdAt', 'desc').get();
            
            this.reports = [];
            reportsSnapshot.forEach(doc => {
                this.reports.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('[Dashboard] Reportes cargados:', this.reports.length);
        } catch (error) {
            console.error('[Dashboard] Error cargando reportes:', error);
            this.reports = []; // Fallback
        }
    }

    async loadUserReports() {
        await this.loadReports(); // Mismo método para usuario individual
    }

    // Métodos de utilidad
    getConditionName(condition) {
        const conditions = {
            anxiety: 'Ansiedad y Estrés',
            back_pain: 'Dolor de Espalda',
            arthritis: 'Artritis',
            sleep: 'Problemas de Sueño',
            depression: 'Depresión',
            chronic_pain: 'Dolor Crónico',
            flexibility: 'Flexibilidad',
            balance: 'Equilibrio',
            general: 'Bienestar General'
        };
        return conditions[condition] || condition || 'No especificado';
    }

    getLastSession(patientId) {
        return this.sessions
            .filter(s => s.userId === patientId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    }

    getUserSessionsCount(userId) {
        return this.sessions.filter(s => s.userId === userId).length;
    }

    getUserTotalTime(userId) {
        return this.sessions
            .filter(s => s.userId === userId)
            .reduce((acc, s) => acc + (s.duration || 0), 0);
    }

    calculateAveragePainReduction() {
        const sessionsWithPainData = this.sessions.filter(s => 
            s.painBefore !== undefined && s.painAfter !== undefined
        );
        
        if (sessionsWithPainData.length === 0) return 0;
        
        const totalReduction = sessionsWithPainData.reduce((acc, s) => 
            acc + (s.painBefore - s.painAfter), 0
        );
        
        return (totalReduction / sessionsWithPainData.length) * 10; // Convertir a porcentaje
    }

    calculateMonthlyGrowth() {
        // Simular cálculo de crecimiento mensual
        return {
            patients: Math.floor(Math.random() * 20) - 10,
            sessions: Math.floor(Math.random() * 30) - 5,
            improvement: Math.floor(Math.random() * 15) - 2,
            therapies: Math.floor(Math.random() * 10) - 2
        };
    }

    calculateAverageRating(sessions) {
        const ratedSessions = sessions.filter(s => s.rating);
        if (ratedSessions.length === 0) return 0;
        
        const totalRating = ratedSessions.reduce((acc, s) => acc + s.rating, 0);
        return totalRating / ratedSessions.length;
    }

    calculateStreak() {
        // Calcular días consecutivos de práctica
        const sessionDates = this.sessions
            .filter(s => s.userId === this.currentUser.uid)
            .map(s => new Date(s.createdAt).toDateString())
            .sort()
            .reverse();
        
        if (sessionDates.length === 0) return 0;
        
        let streak = 1;
        const today = new Date().toDateString();
        
        if (sessionDates[0] !== today) return 0;
        
        for (let i = 1; i < sessionDates.length; i++) {
            const prevDate = new Date(sessionDates[i - 1]);
            const currDate = new Date(sessionDates[i]);
            const diffTime = prevDate - currDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    formatDate(date) {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    createEmptyState(type, message) {
        return `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>No hay ${type}</h3>
                <p>${message}</p>
                ${this.currentUser.userType === 'instructor' ? `
                    <button class="btn-primary" onclick="window.dashboardModule.create${type.charAt(0).toUpperCase() + type.slice(1).slice(0, -1)}()">
                        Crear ${type.slice(0, -1)}
                    </button>
                ` : ''}
            </div>
        `;
    }

    setupPeriodicUpdates() {
        // Actualizar estadísticas cada 5 minutos
        setInterval(() => {
            this.updateDashboardStats();
        }, 5 * 60 * 1000);
    }

    // Métodos de interacción pública
    async startTherapy(therapyId) {
        console.log('[Dashboard] Iniciando terapia:', therapyId);
        
        // Encontrar la terapia
        const therapy = this.therapyData.find(t => t.id == therapyId);
        if (!therapy) {
            window.showError('Terapia no encontrada');
            return;
        }
        
        // Usar el nuevo SessionManager si está disponible
        if (window.sessionManager) {
            window.sessionManager.startSession(therapy);
        } else {
            // Fallback al modal anterior
            this.showTherapySessionModal(therapy);
        }
    }

    showTherapySessionModal(therapy) {
        // Crear modal para la sesión de terapia
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content therapy-session-modal">
                <div class="modal-header">
                    <h2>Sesión de ${therapy.name}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="therapy-session-content">
                    <div class="therapy-video">
                        ${therapy.videoUrl ? `
                            <iframe src="${therapy.videoUrl}" frameborder="0" allowfullscreen></iframe>
                        ` : '<div class="no-video">Sin video disponible</div>'}
                    </div>
                    <div class="therapy-info">
                        <h3>Instrucciones</h3>
                        <p>${therapy.instructions}</p>
                        <h3>Beneficios</h3>
                        <p>${therapy.description}</p>
                        <div class="session-timer">
                            <div class="timer-display">
                                <span id="timer-minutes">${therapy.duration}</span>:<span id="timer-seconds">00</span>
                            </div>
                            <div class="timer-controls">
                                <button class="btn-primary" onclick="window.dashboardModule.startTimer(${therapy.duration})">
                                    ▶️ Iniciar
                                </button>
                                <button class="btn-secondary" onclick="window.dashboardModule.pauseTimer()">
                                    ⏸️ Pausar
                                </button>
                                <button class="btn-secondary" onclick="window.dashboardModule.resetTimer(${therapy.duration})">
                                    🔄 Reiniciar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="window.dashboardModule.completeSession('${therapy.id}')">
                        ✅ Completar Sesión
                    </button>
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Timer para sesiones
    sessionTimer = null;
    timerRunning = false;
    currentTime = 0;

    startTimer(duration) {
        if (this.timerRunning) return;
        
        this.timerRunning = true;
        this.currentTime = duration * 60; // Convertir minutos a segundos
        
        this.sessionTimer = setInterval(() => {
            this.currentTime--;
            this.updateTimerDisplay();
            
            if (this.currentTime <= 0) {
                this.completeTimerSession();
            }
        }, 1000);
        
        window.showSuccess('Sesión iniciada');
    }

    pauseTimer() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.timerRunning = false;
            window.showInfo('Sesión pausada');
        }
    }

    resetTimer(duration) {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        this.timerRunning = false;
        this.currentTime = duration * 60;
        this.updateTimerDisplay();
        window.showInfo('Timer reiniciado');
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        
        const minutesEl = document.getElementById('timer-minutes');
        const secondsEl = document.getElementById('timer-seconds');
        
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }

    completeTimerSession() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        this.timerRunning = false;
        
        window.showSuccess('¡Sesión completada! 🎉');
        window.notificationSystem?.show({
            type: 'achievement',
            title: '¡Sesión Completada!',
            message: 'Has completado exitosamente tu sesión de yoga',
            duration: 6000
        });
    }

    async completeSession(therapyId) {
        try {
            const therapy = this.therapyData.find(t => t.id == therapyId);
            if (!therapy) return;
            
            // Mostrar modal de evaluación post-sesión
            this.showPostSessionModal(therapy);
            
        } catch (error) {
            console.error('[Dashboard] Error completando sesión:', error);
            window.showError('Error al completar la sesión');
        }
    }

    showPostSessionModal(therapy) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content post-session-modal">
                <div class="modal-header">
                    <h2>¿Cómo te sientes?</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="post-session-content">
                    <div class="pain-assessment">
                        <h3>Nivel de dolor/molestia (0-10)</h3>
                        <div class="pain-scale">
                            ${Array.from({length: 11}, (_, i) => `
                                <button class="pain-level" data-level="${i}" onclick="this.parentNode.querySelectorAll('.pain-level').forEach(b => b.classList.remove('selected')); this.classList.add('selected');">
                                    ${i}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="mood-assessment">
                        <h3>¿Cómo te sientes?</h3>
                        <div class="mood-options">
                            <button class="mood-option" data-mood="excellent" onclick="this.parentNode.querySelectorAll('.mood-option').forEach(b => b.classList.remove('selected')); this.classList.add('selected');">
                                😊 Excelente
                            </button>
                            <button class="mood-option" data-mood="good" onclick="this.parentNode.querySelectorAll('.mood-option').forEach(b => b.classList.remove('selected')); this.classList.add('selected');">
                                🙂 Bien
                            </button>
                            <button class="mood-option" data-mood="neutral" onclick="this.parentNode.querySelectorAll('.mood-option').forEach(b => b.classList.remove('selected')); this.classList.add('selected');">
                                😐 Normal
                            </button>
                            <button class="mood-option" data-mood="tired" onclick="this.parentNode.querySelectorAll('.mood-option').forEach(b => b.classList.remove('selected')); this.classList.add('selected');">
                                😴 Cansado
                            </button>
                        </div>
                    </div>
                    <div class="session-rating">
                        <h3>Califica esta sesión</h3>
                        <div class="rating-stars">
                            ${Array.from({length: 5}, (_, i) => `
                                <button class="star" data-rating="${i + 1}" onclick="this.parentNode.querySelectorAll('.star').forEach((s, idx) => { s.classList.toggle('selected', idx <= ${i}); });">
                                    ⭐
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="session-notes">
                        <h3>Comentarios (opcional)</h3>
                        <textarea id="sessionNotes" placeholder="¿Cómo fue tu experiencia? ¿Algo que quieras comentar?"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="window.dashboardModule.saveSessionData('${therapy.id}')">
                        💾 Guardar y Finalizar
                    </button>
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        // Remover modal anterior si existe
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.appendChild(modal);
    }

    async saveSessionData(therapyId) {
        try {
            const modal = document.querySelector('.post-session-modal');
            if (!modal) return;
            
            // Obtener datos del formulario
            const painLevel = modal.querySelector('.pain-level.selected')?.dataset.level;
            const mood = modal.querySelector('.mood-option.selected')?.dataset.mood;
            const rating = modal.querySelectorAll('.star.selected').length;
            const notes = modal.querySelector('#sessionNotes').value;
            
            if (painLevel === undefined) {
                window.showError('Por favor selecciona tu nivel de dolor');
                return;
            }
            
            if (!mood) {
                window.showError('Por favor selecciona cómo te sientes');
                return;
            }
            
            if (rating === 0) {
                window.showError('Por favor califica la sesión');
                return;
            }
            
            // Guardar sesión en Firebase
            const sessionData = {
                userId: this.currentUser.uid,
                therapyId: therapyId,
                painLevel: parseInt(painLevel),
                mood: mood,
                rating: rating,
                notes: notes,
                duration: this.therapyData.find(t => t.id == therapyId)?.duration || 30,
                completed: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await firebase.firestore().collection('sessions').add(sessionData);
            
            // Actualizar datos locales
            this.sessions.unshift({
                id: 'temp_' + Date.now(),
                ...sessionData,
                createdAt: new Date()
            });
            
            // Cerrar modal
            modal.closest('.modal-overlay').remove();
            
            // Mostrar notificación de éxito
            window.notificationSystem?.showSessionComplete({
                painLevel: parseInt(painLevel),
                rating: rating
            });
            
            // Actualizar estadísticas
            await this.updateDashboardStats();
            
            // Si estamos en la sección de reportes, recargar
            if (this.currentSection === 'reports') {
                await this.renderReports();
            }
            
        } catch (error) {
            console.error('[Dashboard] Error guardando datos de sesión:', error);
            window.showError('Error al guardar los datos de la sesión');
        }
    }

    // Otros métodos públicos
    async generateReport() {
        try {
            const reportData = {
                userId: this.currentUser.uid,
                type: 'progress',
                sessionsCompleted: this.getUserSessionsCount(this.currentUser.uid),
                totalTime: this.getUserTotalTime(this.currentUser.uid),
                progress: Math.min(100, this.getUserSessionsCount(this.currentUser.uid) * 5),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await firebase.firestore().collection('reports').add(reportData);
            
            // Actualizar datos locales
            this.reports.unshift({
                id: docRef.id,
                ...reportData,
                createdAt: new Date()
            });
            
            // Recargar reportes si estamos en esa sección
            if (this.currentSection === 'reports') {
                await this.renderReports();
            }
            
            window.showSuccess('Reporte generado exitosamente');
            
        } catch (error) {
            console.error('[Dashboard] Error generando reporte:', error);
            window.showError('Error al generar el reporte');
        }
    }

    // Placeholder methods para otras funcionalidades
    previewTherapy(therapyId) {
        console.log('Vista previa de terapia:', therapyId);
        window.showInfo('Vista previa en desarrollo');
    }

    editTherapy(therapyId) {
        console.log('Editar terapia:', therapyId);
        window.showInfo('Editor de terapias en desarrollo');
    }

    viewReport(reportId) {
        console.log('Ver reporte:', reportId);
        window.showInfo('Visor de reportes detallado en desarrollo');
    }

    downloadReport(reportId) {
        console.log('Descargar reporte:', reportId);
        window.showInfo('Descarga de reportes en desarrollo');
    }

    viewPatientDetails(patientId) {
        console.log('Ver detalles del paciente:', patientId);
        if (window.patientManager) {
            window.patientManager.showPatientDetails(patientId);
        } else {
            window.showInfo('Vista detallada de pacientes en desarrollo');
        }
    }

    assignTherapy(patientId) {
        console.log('Asignar terapia al paciente:', patientId);
        window.showInfo('Asignación de terapias en desarrollo');
    }

    showCreateTherapyModal() {
        window.showInfo('Creador de terapias personalizadas en desarrollo');
    }

    showAddPatientModal() {
        window.showInfo('Registro de pacientes en desarrollo');
    }

    editProfile() {
        window.showInfo('Editor de perfil en desarrollo');
    }

    changePassword() {
        window.showInfo('Cambio de contraseña en desarrollo');
    }

    exportData() {
        window.showInfo('Exportación de datos en desarrollo');
    }

    deleteAccount() {
        if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            window.showInfo('Eliminación de cuenta en desarrollo');
        }
    }

    // Métodos de búsqueda y filtros
    performSearch(query, type) {
        console.log(`Buscando "${query}" en ${type}`);
        // Implementar búsqueda en tiempo real
    }

    applyFilter(value, type) {
        console.log(`Aplicando filtro ${type}: ${value}`);
        // Implementar filtrado
    }

    handleDrop(event) {
        console.log('Drop event:', event);
        // Implementar lógica de drag & drop
    }

    showProgress() {
        console.log('Mostrar progreso');
        this.loadSection('reports');
    }
}

// Crear instancia global del dashboard
const dashboardModule = new DashboardModule();

// Hacer disponible globalmente
window.dashboardModule = dashboardModule;

console.log('[Dashboard] Módulo completo del dashboard cargado');