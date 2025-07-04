// Módulo de Gestión de Pacientes - SoftZen v2.1
// Sistema completo para gestión y seguimiento de pacientes

class PatientManager {
    constructor() {
        this.patients = [];
        this.currentPatient = null;
        this.isInitialized = false;
    }

    async init() {
        console.log('[PatientManager] Inicializando gestor de pacientes...');
        
        try {
            await this.loadPatients();
            this.isInitialized = true;
            console.log('[PatientManager] Gestor inicializado');
        } catch (error) {
            console.error('[PatientManager] Error en inicialización:', error);
        }
    }

    async loadPatients() {
        try {
            const snapshot = await firebase.firestore()
                .collection('users')
                .where('userType', '==', 'patient')
                .get();
            
            this.patients = [];
            snapshot.forEach(doc => {
                this.patients.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('[PatientManager] Pacientes cargados:', this.patients.length);
        } catch (error) {
            console.error('[PatientManager] Error cargando pacientes:', error);
        }
    }

    // Mostrar modal para agregar paciente
    showAddPatientModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content patient-modal">
                <div class="modal-header">
                    <h2>Agregar Nuevo Paciente</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                
                <form id="addPatientForm" class="patient-form">
                    <div class="form-section">
                        <h3>Información Personal</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="patientName">Nombre Completo *</label>
                                <input type="text" id="patientName" class="form-input" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="patientEmail">Email *</label>
                                <input type="email" id="patientEmail" class="form-input" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="patientAge">Edad *</label>
                                <input type="number" id="patientAge" class="form-input" 
                                    min="18" max="100" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="patientPhone">Teléfono</label>
                                <input type="tel" id="patientPhone" class="form-input" 
                                    placeholder="+593 999 999 999">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="patientAddress">Dirección</label>
                            <input type="text" id="patientAddress" class="form-input" 
                                placeholder="Ciudad, País">
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Información Médica</h3>
                        <div class="form-group">
                            <label for="patientCondition">Condición Principal *</label>
                            <select id="patientCondition" class="form-select" required>
                                <option value="">Selecciona una condición</option>
                                <option value="anxiety">Ansiedad y Manejo del Estrés</option>
                                <option value="back_pain">Dolor de Espalda y Cervical</option>
                                <option value="arthritis">Artritis y Rigidez Articular</option>
                                <option value="sleep">Problemas de Sueño e Insomnio</option>
                                <option value="depression">Depresión y Estado de Ánimo</option>
                                <option value="chronic_pain">Dolor Crónico General</option>
                                <option value="flexibility">Mejorar Flexibilidad</option>
                                <option value="balance">Equilibrio y Coordinación</option>
                                <option value="general">Bienestar General</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="patientDiagnosis">Diagnóstico/Historial Médico</label>
                            <textarea id="patientDiagnosis" class="form-textarea" rows="3"
                                placeholder="Describe el diagnóstico médico o historial relevante"></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="painLevel">Nivel de Dolor Inicial (0-10)</label>
                                <input type="range" id="painLevel" class="form-range" 
                                    min="0" max="10" value="5" oninput="this.nextElementSibling.textContent = this.value">
                                <span class="range-value">5</span>
                            </div>
                            
                            <div class="form-group">
                                <label for="mobilityLevel">Nivel de Movilidad</label>
                                <select id="mobilityLevel" class="form-select">
                                    <option value="full">Movilidad Completa</option>
                                    <option value="limited">Movilidad Limitada</option>
                                    <option value="assisted">Requiere Asistencia</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="medications">Medicamentos Actuales</label>
                            <input type="text" id="medications" class="form-input" 
                                placeholder="Lista de medicamentos que toma actualmente">
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Contacto de Emergencia</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="emergencyName">Nombre</label>
                                <input type="text" id="emergencyName" class="form-input">
                            </div>
                            
                            <div class="form-group">
                                <label for="emergencyPhone">Teléfono</label>
                                <input type="tel" id="emergencyPhone" class="form-input">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="emergencyRelation">Relación</label>
                            <input type="text" id="emergencyRelation" class="form-input" 
                                placeholder="Ej: Esposo, Hija, Amigo">
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Preferencias y Objetivos</h3>
                        <div class="form-group">
                            <label for="goals">Objetivos del Tratamiento</label>
                            <textarea id="goals" class="form-textarea" rows="3"
                                placeholder="¿Qué espera lograr con el yoga terapéutico?"></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="preferredTime">Horario Preferido</label>
                                <select id="preferredTime" class="form-select">
                                    <option value="morning">Mañana (6am - 12pm)</option>
                                    <option value="afternoon">Tarde (12pm - 6pm)</option>
                                    <option value="evening">Noche (6pm - 9pm)</option>
                                    <option value="flexible">Flexible</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="sessionFrequency">Frecuencia Deseada</label>
                                <select id="sessionFrequency" class="form-select">
                                    <option value="daily">Diaria</option>
                                    <option value="3-week">3 veces por semana</option>
                                    <option value="2-week">2 veces por semana</option>
                                    <option value="weekly">Semanal</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn-primary">
                            💾 Guardar Paciente
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar evento de submit
        document.getElementById('addPatientForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePatient();
        });
    }

    async savePatient() {
        try {
            // Recopilar datos del formulario
            const patientData = {
                name: document.getElementById('patientName').value.trim(),
                email: document.getElementById('patientEmail').value.trim(),
                age: parseInt(document.getElementById('patientAge').value),
                phone: document.getElementById('patientPhone').value.trim(),
                address: document.getElementById('patientAddress').value.trim(),
                condition: document.getElementById('patientCondition').value,
                diagnosis: document.getElementById('patientDiagnosis').value.trim(),
                painLevel: parseInt(document.getElementById('painLevel').value),
                mobilityLevel: document.getElementById('mobilityLevel').value,
                medications: document.getElementById('medications').value.trim(),
                emergencyContact: {
                    name: document.getElementById('emergencyName').value.trim(),
                    phone: document.getElementById('emergencyPhone').value.trim(),
                    relation: document.getElementById('emergencyRelation').value.trim()
                },
                goals: document.getElementById('goals').value.trim(),
                preferredTime: document.getElementById('preferredTime').value,
                sessionFrequency: document.getElementById('sessionFrequency').value,
                userType: 'patient',
                isActive: true,
                instructorId: firebase.auth().currentUser.uid, // Asignar al instructor actual
                assignedTherapies: [], // Array vacío inicial
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                sessionsCompleted: 0,
                totalSessionTime: 0
            };
            
            // Crear usuario en Firebase Auth con contraseña temporal
            const tempPassword = this.generateTempPassword();
            
            // Guardar el usuario actual antes de crear el nuevo
            const currentUser = firebase.auth().currentUser;
            
            try {
                // Crear nuevo usuario
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(
                    patientData.email,
                    tempPassword
                );
                
                // Guardar datos en Firestore
                await firebase.firestore().collection('users').doc(userCredential.user.uid).set(patientData);
                
                // Enviar email de restablecimiento de contraseña
                await firebase.auth().sendPasswordResetEmail(patientData.email);
                
                // Re-autenticar al instructor original
                await firebase.auth().updateCurrentUser(currentUser);
                
                // Agregar a la lista local
                this.patients.push({
                    id: userCredential.user.uid,
                    ...patientData
                });
                
                // Cerrar modal
                document.querySelector('.modal-overlay').remove();
                
                // Notificar éxito
                window.notificationSystem?.show({
                    type: 'success',
                    title: '¡Paciente Agregado!',
                    message: `${patientData.name} ha sido agregado exitosamente. Se ha enviado un email para que configure su contraseña.`,
                    duration: 6000
                });
                
                // Actualizar lista si estamos en la sección de usuarios
                if (window.dashboardModule && window.dashboardModule.currentSection === 'users') {
                    window.dashboardModule.renderUsers();
                }
                
            } catch (error) {
                // Si hay error, asegurarse de volver al usuario original
                if (currentUser) {
                    await firebase.auth().updateCurrentUser(currentUser);
                }
                throw error;
            }
            
        } catch (error) {
            console.error('[PatientManager] Error guardando paciente:', error);
            window.showError('Error al guardar el paciente: ' + error.message);
        }
    }
    async assignPatientToInstructor(patientId, instructorId) {
        try {
            await firebase.firestore().collection('users').doc(patientId).update({
                instructorId: instructorId,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('[PatientManager] Paciente asignado al instructor');
            return true;
        } catch (error) {
            console.error('[PatientManager] Error asignando paciente:', error);
            return false;
        }
    }

    generateTempPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    // Ver detalles del paciente
    async showPatientDetails(patientId) {
        try {
            const patient = this.patients.find(p => p.id === patientId);
            if (!patient) {
                const doc = await firebase.firestore().collection('users').doc(patientId).get();
                if (!doc.exists) {
                    window.showError('Paciente no encontrado');
                    return;
                }
                patient = { id: doc.id, ...doc.data() };
            }
            
            this.currentPatient = patient;
            
            // Cargar datos adicionales
            const sessions = await this.loadPatientSessions(patientId);
            const assignments = await this.loadPatientAssignments(patientId);
            
            // Crear modal de detalles
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content patient-details-modal">
                    <div class="modal-header">
                        <h2>Detalles del Paciente</h2>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    
                    <div class="patient-details-content">
                        <div class="patient-header-info">
                            <div class="patient-avatar-large">
                                ${patient.name.charAt(0).toUpperCase()}
                            </div>
                            <div class="patient-main-info">
                                <h3>${patient.name}</h3>
                                <p>${patient.email}</p>
                                <p>${patient.age} años • ${this.getConditionName(patient.condition)}</p>
                                <div class="patient-status-badge ${patient.isActive ? 'active' : 'inactive'}">
                                    ${patient.isActive ? 'Activo' : 'Inactivo'}
                                </div>
                            </div>
                            <div class="patient-quick-stats">
                                <div class="stat">
                                    <span class="stat-value">${sessions.length}</span>
                                    <span class="stat-label">Sesiones</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value">${patient.painLevel || 'N/A'}</span>
                                    <span class="stat-label">Dolor Actual</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value">${this.calculateImprovement(sessions)}%</span>
                                    <span class="stat-label">Mejora</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="patient-tabs">
                            <button class="tab-btn active" onclick="window.patientManager.showTab('info', this)">
                                Información
                            </button>
                            <button class="tab-btn" onclick="window.patientManager.showTab('progress', this)">
                                Progreso
                            </button>
                            <button class="tab-btn" onclick="window.patientManager.showTab('sessions', this)">
                                Sesiones
                            </button>
                            <button class="tab-btn" onclick="window.patientManager.showTab('therapies', this)">
                                Terapias
                            </button>
                        </div>
                        
                        <div class="tab-content active" id="info-tab">
                            ${this.renderPatientInfo(patient)}
                        </div>
                        
                        <div class="tab-content" id="progress-tab" style="display:none;">
                            ${this.renderPatientProgress(patient, sessions)}
                        </div>
                        
                        <div class="tab-content" id="sessions-tab" style="display:none;">
                            ${this.renderPatientSessions(sessions)}
                        </div>
                        
                        <div class="tab-content" id="therapies-tab" style="display:none;">
                            ${this.renderPatientTherapies(assignments)}
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.patientManager.editPatient('${patientId}')">
                            ✏️ Editar
                        </button>
                        <button class="btn-primary" onclick="window.patientManager.assignNewTherapy('${patientId}')">
                            + Asignar Terapia
                        </button>
                        <button class="btn-primary" onclick="window.patientManager.generatePatientReport('${patientId}')">
                            📊 Generar Reporte
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
        } catch (error) {
            console.error('[PatientManager] Error mostrando detalles:', error);
            window.showError('Error al cargar los detalles del paciente');
        }
    }

    renderPatientInfo(patient) {
        return `
            <div class="info-sections">
                <div class="info-section">
                    <h4>Información Personal</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Teléfono:</label>
                            <span>${patient.phone || 'No registrado'}</span>
                        </div>
                        <div class="info-item">
                            <label>Dirección:</label>
                            <span>${patient.address || 'No registrada'}</span>
                        </div>
                        <div class="info-item">
                            <label>Edad:</label>
                            <span>${patient.age} años</span>
                        </div>
                        <div class="info-item">
                            <label>Miembro desde:</label>
                            <span>${this.formatDate(patient.createdAt)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Información Médica</h4>
                    <div class="info-grid">
                        <div class="info-item full-width">
                            <label>Condición Principal:</label>
                            <span>${this.getConditionName(patient.condition)}</span>
                        </div>
                        <div class="info-item full-width">
                            <label>Diagnóstico:</label>
                            <span>${patient.diagnosis || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <label>Nivel de Dolor:</label>
                            <span>${patient.painLevel}/10</span>
                        </div>
                        <div class="info-item">
                            <label>Movilidad:</label>
                            <span>${this.getMobilityName(patient.mobilityLevel)}</span>
                        </div>
                        <div class="info-item full-width">
                            <label>Medicamentos:</label>
                            <span>${patient.medications || 'Ninguno'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Contacto de Emergencia</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Nombre:</label>
                            <span>${patient.emergencyContact?.name || 'No registrado'}</span>
                        </div>
                        <div class="info-item">
                            <label>Teléfono:</label>
                            <span>${patient.emergencyContact?.phone || 'No registrado'}</span>
                        </div>
                        <div class="info-item">
                            <label>Relación:</label>
                            <span>${patient.emergencyContact?.relation || 'No especificada'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Preferencias y Objetivos</h4>
                    <div class="info-grid">
                        <div class="info-item full-width">
                            <label>Objetivos:</label>
                            <span>${patient.goals || 'No especificados'}</span>
                        </div>
                        <div class="info-item">
                            <label>Horario Preferido:</label>
                            <span>${this.getTimeName(patient.preferredTime)}</span>
                        </div>
                        <div class="info-item">
                            <label>Frecuencia:</label>
                            <span>${this.getFrequencyName(patient.sessionFrequency)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPatientProgress(patient, sessions) {
        // Calcular estadísticas de progreso
        const stats = this.calculateProgressStats(sessions);
        
        return `
            <div class="progress-content">
                <div class="progress-overview">
                    <div class="progress-card">
                        <h4>Reducción del Dolor</h4>
                        <div class="progress-chart">
                            <canvas id="painChart"></canvas>
                        </div>
                        <p class="progress-summary">
                            Mejora promedio: <strong>${stats.avgImprovement}%</strong>
                        </p>
                    </div>
                    
                    <div class="progress-card">
                        <h4>Frecuencia de Práctica</h4>
                        <div class="progress-chart">
                            <canvas id="frequencyChart"></canvas>
                        </div>
                        <p class="progress-summary">
                            Adherencia: <strong>${stats.adherence}%</strong>
                        </p>
                    </div>
                    
                    <div class="progress-card">
                        <h4>Estado de Ánimo</h4>
                        <div class="mood-stats">
                            ${this.renderMoodStats(sessions)}
                        </div>
                    </div>
                </div>
                
                <div class="progress-timeline">
                    <h4>Línea de Tiempo del Progreso</h4>
                    ${this.renderProgressTimeline(sessions)}
                </div>
            </div>
        `;
    }

    renderPatientSessions(sessions) {
        if (sessions.length === 0) {
            return '<p class="empty-message">No hay sesiones registradas aún</p>';
        }
        
        return `
            <div class="sessions-list">
                ${sessions.map(session => `
                    <div class="session-card">
                        <div class="session-date">
                            ${this.formatDate(session.createdAt)}
                        </div>
                        <div class="session-info">
                            <h5>${session.therapyName || 'Sesión de Yoga'}</h5>
                            <div class="session-stats">
                                <span>Duración: ${session.duration} min</span>
                                <span>Dolor: ${session.painBefore} → ${session.painAfter}</span>
                                <span>Calificación: ${'⭐'.repeat(session.rating || 0)}</span>
                            </div>
                            ${session.notes ? `<p class="session-notes">"${session.notes}"</p>` : ''}
                        </div>
                        <div class="session-improvement ${session.painBefore > session.painAfter ? 'positive' : 'neutral'}">
                            ${session.painBefore > session.painAfter ? '↓' : '='} 
                            ${Math.abs(session.painBefore - session.painAfter)} puntos
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPatientTherapies(assignments) {
        if (assignments.length === 0) {
            return '<p class="empty-message">No hay terapias asignadas</p>';
        }
        
        return `
            <div class="therapies-list">
                ${assignments.map(assignment => `
                    <div class="therapy-assignment-card">
                        <div class="assignment-header">
                            <h5>${assignment.seriesName}</h5>
                            <span class="assignment-status ${assignment.status}">
                                ${this.getStatusName(assignment.status)}
                            </span>
                        </div>
                        <div class="assignment-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${assignment.progress}%"></div>
                            </div>
                            <span>${assignment.completedSessions}/${assignment.totalSessions} sesiones</span>
                        </div>
                        <div class="assignment-actions">
                            <button class="btn-small" onclick="window.patientManager.viewAssignment('${assignment.id}')">
                                Ver Detalles
                            </button>
                            <button class="btn-small" onclick="window.patientManager.modifyAssignment('${assignment.id}')">
                                Modificar
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showTab(tabName, button) {
        // Ocultar todos los tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
            tab.classList.remove('active');
        });
        
        // Desactivar todos los botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Mostrar tab seleccionado
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.style.display = 'block';
            selectedTab.classList.add('active');
        }
        
        // Activar botón
        button.classList.add('active');
        
        // Si es el tab de progreso, renderizar gráficos
        if (tabName === 'progress') {
            setTimeout(() => this.renderProgressCharts(), 100);
        }
    }

    async loadPatientSessions(patientId) {
        try {
            const snapshot = await firebase.firestore()
                .collection('sessions')
                .where('userId', '==', patientId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const sessions = [];
            snapshot.forEach(doc => {
                sessions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return sessions;
        } catch (error) {
            console.error('[PatientManager] Error cargando sesiones:', error);
            return [];
        }
    }

    async loadPatientAssignments(patientId) {
        try {
            const snapshot = await firebase.firestore()
                .collection('therapy_assignments')
                .where('patientId', '==', patientId)
                .get();
            
            const assignments = [];
            snapshot.forEach(doc => {
                assignments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return assignments;
        } catch (error) {
            console.error('[PatientManager] Error cargando asignaciones:', error);
            return [];
        }
    }

    calculateImprovement(sessions) {
        if (sessions.length === 0) return 0;
        
        const sessionsWithPain = sessions.filter(s => 
            s.painBefore !== undefined && s.painAfter !== undefined
        );
        
        if (sessionsWithPain.length === 0) return 0;
        
        const totalImprovement = sessionsWithPain.reduce((sum, s) => {
            const improvement = ((s.painBefore - s.painAfter) / s.painBefore) * 100;
            return sum + improvement;
        }, 0);
        
        return Math.round(totalImprovement / sessionsWithPain.length);
    }

    calculateProgressStats(sessions) {
        // Implementar cálculo de estadísticas
        return {
            avgImprovement: this.calculateImprovement(sessions),
            adherence: 85, // Placeholder
            moodImprovement: 70 // Placeholder
        };
    }

    renderMoodStats(sessions) {
        const moods = {
            excellent: 0,
            good: 0,
            neutral: 0,
            tired: 0
        };
        
        sessions.forEach(s => {
            if (s.mood) moods[s.mood]++;
        });
        
        return Object.entries(moods).map(([mood, count]) => `
            <div class="mood-stat">
                <span class="mood-emoji">${this.getMoodEmoji(mood)}</span>
                <span class="mood-count">${count}</span>
            </div>
        `).join('');
    }

    renderProgressTimeline(sessions) {
        // Implementar timeline de progreso
        return '<div class="timeline-placeholder">Timeline en desarrollo</div>';
    }

    renderProgressCharts() {
        // Implementar renderizado de gráficos con Chart.js
        console.log('[PatientManager] Renderizando gráficos de progreso');
    }

    // Utilidades
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
        return conditions[condition] || condition;
    }

    getMobilityName(level) {
        const levels = {
            full: 'Movilidad Completa',
            limited: 'Movilidad Limitada',
            assisted: 'Requiere Asistencia'
        };
        return levels[level] || level;
    }

    getTimeName(time) {
        const times = {
            morning: 'Mañana',
            afternoon: 'Tarde',
            evening: 'Noche',
            flexible: 'Flexible'
        };
        return times[time] || time;
    }

    getFrequencyName(frequency) {
        const frequencies = {
            daily: 'Diaria',
            '3-week': '3 veces por semana',
            '2-week': '2 veces por semana',
            weekly: 'Semanal'
        };
        return frequencies[frequency] || frequency;
    }

    getStatusName(status) {
        const statuses = {
            active: 'Activa',
            completed: 'Completada',
            paused: 'Pausada',
            cancelled: 'Cancelada'
        };
        return statuses[status] || status;
    }

    getMoodEmoji(mood) {
        const emojis = {
            excellent: '😊',
            good: '🙂',
            neutral: '😐',
            tired: '😴'
        };
        return emojis[mood] || '😐';
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

    // Métodos adicionales
    async assignNewTherapy(patientId) {
        // Implementar asignación de terapia
        window.showInfo('Asignación de terapias en desarrollo');
    }

    async generatePatientReport(patientId) {
        // Implementar generación de reporte
        window.showInfo('Generación de reportes en desarrollo');
    }

    async editPatient(patientId) {
        // Implementar edición de paciente
        window.showInfo('Edición de pacientes en desarrollo');
    }
}

// Crear instancia global
window.patientManager = new PatientManager();

console.log('[PatientManager] Módulo de gestión de pacientes cargado');