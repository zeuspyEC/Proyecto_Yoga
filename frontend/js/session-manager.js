// Módulo de Sesión de Terapia - SoftZen v2.1
// Sistema completo para ejecutar sesiones de yoga con videos, timer y evaluaciones

class SessionManager {
    constructor() {
        this.currentSession = null;
        this.currentPostureIndex = 0;
        this.sessionData = {
            startTime: null,
            endTime: null,
            postures: [],
            painBefore: null,
            painAfter: null,
            moodBefore: null,
            moodAfter: null,
            photos: {
                initial: null,
                final: null
            }
        };
        this.timer = null;
        this.timeRemaining = 0;
        this.isPaused = false;
        this.isInitialized = false;
    }

    init() {
        console.log('[SessionManager] Inicializando gestor de sesiones...');
        this.isInitialized = true;
    }

    // Iniciar nueva sesión
    async startSession(therapy) {
        console.log('[SessionManager] Iniciando sesión:', therapy.name);
        
        this.currentSession = therapy;
        this.currentPostureIndex = 0;
        this.sessionData = {
            therapyId: therapy.id,
            therapyName: therapy.name,
            userId: firebase.auth().currentUser.uid,
            startTime: new Date(),
            postures: therapy.postures || [],
            painBefore: null,
            moodBefore: null,
            completedPostures: [],
            skippedPostures: []
        };
        
        // Mostrar modal de pre-sesión
        this.showPreSessionModal();
    }

    showPreSessionModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay session-modal';
        modal.innerHTML = `
            <div class="modal-content pre-session-modal">
                <div class="modal-header">
                    <h2>Preparación para tu Sesión</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                
                <div class="pre-session-content">
                    <div class="session-info">
                        <h3>${this.currentSession.name}</h3>
                        <p>${this.currentSession.description || ''}</p>
                        <div class="session-meta">
                            <span>⏱️ Duración: ${this.currentSession.duration || 30} minutos</span>
                            <span>🧘 ${this.sessionData.postures.length} posturas</span>
                        </div>
                    </div>
                    
                    <div class="preparation-checklist">
                        <h4>Lista de Preparación</h4>
                        <label class="checkbox-item">
                            <input type="checkbox" id="check1">
                            <span>✅ Espacio tranquilo y limpio preparado</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" id="check2">
                            <span>📱 Dispositivo en posición visible</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" id="check3">
                            <span>💧 Agua disponible cerca</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" id="check4">
                            <span>🧘‍♀️ Ropa cómoda puesta</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" id="check5">
                            <span>🎵 Ambiente tranquilo (sin distracciones)</span>
                        </label>
                    </div>
                    
                    <div class="initial-assessment">
                        <h4>¿Cómo te sientes ahora?</h4>
                        
                        <div class="pain-assessment">
                            <label>Nivel de dolor/molestia (0-10)</label>
                            <div class="pain-scale">
                                ${Array.from({length: 11}, (_, i) => `
                                    <button class="pain-level" data-level="${i}" 
                                        onclick="window.sessionManager.selectPainLevel(${i}, 'before')">
                                        ${i}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="mood-assessment">
                            <label>Estado de ánimo</label>
                            <div class="mood-options">
                                <button class="mood-option" data-mood="excellent" 
                                    onclick="window.sessionManager.selectMood('excellent', 'before')">
                                    😊 Excelente
                                </button>
                                <button class="mood-option" data-mood="good" 
                                    onclick="window.sessionManager.selectMood('good', 'before')">
                                    🙂 Bien
                                </button>
                                <button class="mood-option" data-mood="neutral" 
                                    onclick="window.sessionManager.selectMood('neutral', 'before')">
                                    😐 Normal
                                </button>
                                <button class="mood-option" data-mood="tired" 
                                    onclick="window.sessionManager.selectMood('tired', 'before')">
                                    😴 Cansado
                                </button>
                                <button class="mood-option" data-mood="stressed" 
                                    onclick="window.sessionManager.selectMood('stressed', 'before')">
                                    😰 Estresado
                                </button>
                            </div>
                        </div>
                        
                        <div class="photo-capture">
                            <label>Foto inicial (opcional)</label>
                            <div class="photo-options">
                                <button class="btn-secondary" onclick="window.sessionManager.capturePhoto('initial')">
                                    📸 Tomar Foto
                                </button>
                                <div id="initialPhotoPreview" class="photo-preview"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                    <button class="btn-primary" id="startSessionBtn" 
                        onclick="window.sessionManager.proceedToSession()" disabled>
                        🧘 Comenzar Sesión
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Verificar checklist para habilitar botón
        this.setupChecklistValidation();
    }

    setupChecklistValidation() {
        const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
        const startBtn = document.getElementById('startSessionBtn');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                const hasAssessment = this.sessionData.painBefore !== null && 
                                    this.sessionData.moodBefore !== null;
                
                startBtn.disabled = !(allChecked && hasAssessment);
            });
        });
    }

    selectPainLevel(level, timing) {
        // Deseleccionar otros
        document.querySelectorAll('.pain-level').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Seleccionar actual
        event.target.classList.add('selected');
        
        if (timing === 'before') {
            this.sessionData.painBefore = level;
        } else {
            this.sessionData.painAfter = level;
        }
        
        this.checkReadyToStart();
    }

    selectMood(mood, timing) {
        // Deseleccionar otros
        event.target.parentNode.querySelectorAll('.mood-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Seleccionar actual
        event.target.classList.add('selected');
        
        if (timing === 'before') {
            this.sessionData.moodBefore = mood;
        } else {
            this.sessionData.moodAfter = mood;
        }
        
        this.checkReadyToStart();
    }

    checkReadyToStart() {
        const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        const hasAssessment = this.sessionData.painBefore !== null && 
                            this.sessionData.moodBefore !== null;
        
        const startBtn = document.getElementById('startSessionBtn');
        if (startBtn) {
            startBtn.disabled = !(allChecked && hasAssessment);
        }
    }

    async capturePhoto(type) {
        try {
            // Solicitar acceso a la cámara
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            
            // Crear elemento de video temporal
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            
            // Esperar a que el video esté listo
            await new Promise(resolve => {
                video.onloadedmetadata = resolve;
            });
            
            // Crear canvas para capturar
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            // Detener stream
            stream.getTracks().forEach(track => track.stop());
            
            // Convertir a blob
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                this.sessionData.photos[type] = blob;
                
                // Mostrar preview
                const preview = document.getElementById(`${type}PhotoPreview`);
                if (preview) {
                    preview.innerHTML = `<img src="${url}" alt="Foto ${type}">`;
                }
            }, 'image/jpeg', 0.8);
            
        } catch (error) {
            console.error('[SessionManager] Error capturando foto:', error);
            window.showError('No se pudo acceder a la cámara');
        }
    }

    proceedToSession() {
        // Cerrar modal de preparación
        document.querySelector('.pre-session-modal').closest('.modal-overlay').remove();
        
        // Mostrar primera postura
        this.showPostureScreen();
    }

    showPostureScreen() {
        const posture = this.sessionData.postures[this.currentPostureIndex];
        if (!posture) {
            this.completeSession();
            return;
        }
        
        // Procesar URL de video de YouTube para embed
        let videoEmbed = '';
        if (posture.videoUrl) {
            // Extraer ID del video de YouTube
            const videoId = this.extractYouTubeId(posture.videoUrl);
            if (videoId) {
                videoEmbed = `<iframe 
                    src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" 
                    frameborder="0" 
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                </iframe>`;
            }
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay posture-modal fullscreen';
        modal.innerHTML = `
            <div class="posture-screen">
                <div class="posture-header">
                    <div class="posture-progress">
                        <span>Postura ${this.currentPostureIndex + 1} de ${this.sessionData.postures.length}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${((this.currentPostureIndex + 1) / this.sessionData.postures.length) * 100}%"></div>
                        </div>
                    </div>
                    <button class="btn-exit" onclick="window.sessionManager.pauseSession()">
                        ⏸️ Pausar
                    </button>
                </div>
                
                <div class="posture-content">
                    <div class="posture-main">
                        <h2>${posture.name}</h2>
                        <p class="sanskrit">${posture.sanskrit}</p>
                        
                        <div class="video-container">
                            ${videoEmbed || `<img src="${posture.image}" alt="${posture.name}" class="posture-image">`}
                        </div>
                        
                        <div class="timer-container">
                            <div class="timer-circle">
                                <svg class="timer-svg" viewBox="0 0 200 200">
                                    <circle class="timer-bg" cx="100" cy="100" r="90"/>
                                    <circle class="timer-progress" cx="100" cy="100" r="90" 
                                        stroke-dasharray="565" 
                                        stroke-dashoffset="565"/>
                                </svg>
                                <div class="timer-display">
                                    <span id="timerMinutes">${Math.floor(posture.defaultDuration)}</span>:<span id="timerSeconds">00</span>
                                </div>
                            </div>
                            
                            <div class="timer-controls">
                                <button class="btn-timer" id="startTimerBtn" onclick="window.sessionManager.startPostureTimer()">
                                    ▶️ Iniciar
                                </button>
                                <button class="btn-timer" id="pauseTimerBtn" onclick="window.sessionManager.pauseTimer()" style="display:none;">
                                    ⏸️ Pausar
                                </button>
                                <button class="btn-timer" onclick="window.sessionManager.resetTimer()">
                                    🔄 Reiniciar
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="posture-sidebar">
                        <div class="info-tabs">
                            <button class="tab-btn active" onclick="window.sessionManager.showTab('instructions')">
                                📝 Instrucciones
                            </button>
                            <button class="tab-btn" onclick="window.sessionManager.showTab('benefits')">
                                ✨ Beneficios
                            </button>
                            <button class="tab-btn" onclick="window.sessionManager.showTab('modifications')">
                                🔧 Modificaciones
                            </button>
                        </div>
                        
                        <div class="tab-content active" id="instructions-tab">
                            <h4>Cómo realizar la postura:</h4>
                            <p>${posture.instructions}</p>
                        </div>
                        
                        <div class="tab-content" id="benefits-tab" style="display:none;">
                            <h4>Beneficios:</h4>
                            <p>${posture.benefits}</p>
                        </div>
                        
                        <div class="tab-content" id="modifications-tab" style="display:none;">
                            <h4>Adaptaciones:</h4>
                            <p>${posture.modifications || 'Consulta con tu instructor para adaptaciones personalizadas.'}</p>
                        </div>
                        
                        <div class="posture-notes">
                            <label>Notas personales:</label>
                            <textarea id="postureNotes" placeholder="¿Cómo te sientes con esta postura?"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="posture-footer">
                    <button class="btn-secondary" onclick="window.sessionManager.skipPosture()">
                        ⏭️ Saltar Postura
                    </button>
                    <button class="btn-primary" id="completePostureBtn" onclick="window.sessionManager.completePosture()" disabled>
                        ✅ Siguiente Postura
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-iniciar timer después de 3 segundos
        setTimeout(() => {
            if (!this.timer) {
                this.startPostureTimer();
            }
        }, 3000);
    }

    extractYouTubeId(url) {
        if (!url) return null;
        
        // Patrones para extraer ID de YouTube
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        
        return null;
    }

    startPostureTimer() {
        if (this.timer) return;
        
        const posture = this.sessionData.postures[this.currentPostureIndex];
        this.timeRemaining = posture.defaultDuration * 60; // Convertir a segundos
        this.isPaused = false;
        
        // Actualizar botones
        document.getElementById('startTimerBtn').style.display = 'none';
        document.getElementById('pauseTimerBtn').style.display = 'inline-block';
        
        // Habilitar botón de completar
        document.getElementById('completePostureBtn').disabled = false;
        
        const timerProgress = document.querySelector('.timer-progress');
        const totalDuration = posture.defaultDuration * 60;
        
        this.timer = setInterval(() => {
            if (!this.isPaused && this.timeRemaining > 0) {
                this.timeRemaining--;
                
                // Actualizar display
                const minutes = Math.floor(this.timeRemaining / 60);
                const seconds = this.timeRemaining % 60;
                document.getElementById('timerMinutes').textContent = minutes;
                document.getElementById('timerSeconds').textContent = String(seconds).padStart(2, '0');
                
                // Actualizar círculo de progreso
                if (timerProgress) {
                    const progress = (totalDuration - this.timeRemaining) / totalDuration;
                    const offset = 565 - (565 * progress);
                    timerProgress.style.strokeDashoffset = offset;
                }
                
                // Alertas de tiempo
                if (this.timeRemaining === 30) {
                    this.playSound('30-seconds');
                    window.notificationSystem?.show({
                        type: 'info',
                        message: '30 segundos restantes',
                        duration: 2000
                    });
                } else if (this.timeRemaining === 10) {
                    this.playSound('10-seconds');
                    window.notificationSystem?.show({
                        type: 'warning',
                        message: '10 segundos restantes',
                        duration: 2000
                    });
                } else if (this.timeRemaining === 0) {
                    this.playSound('complete');
                    window.notificationSystem?.show({
                        type: 'success',
                        message: '¡Postura completada!',
                        duration: 3000
                    });
                    this.completePosture();
                }
            }
        }, 1000);
    }


    pauseTimer() {
        this.isPaused = !this.isPaused;
        const pauseBtn = event.target;
        pauseBtn.textContent = this.isPaused ? '▶️ Continuar' : '⏸️ Pausar';
    }

    resetTimer() {
        const posture = this.sessionData.postures[this.currentPostureIndex];
        this.timeRemaining = posture.defaultDuration * 60;
        this.updateTimerDisplay();
        
        // Resetear círculo de progreso
        const timerProgress = document.querySelector('.timer-progress');
        if (timerProgress) {
            timerProgress.style.strokeDashoffset = 565;
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        document.getElementById('timerMinutes').textContent = minutes;
        document.getElementById('timerSeconds').textContent = String(seconds).padStart(2, '0');
    }

    showTab(tabName) {
        // Ocultar todos los tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Mostrar tab seleccionado
        document.getElementById(`${tabName}-tab`).style.display = 'block';
        document.getElementById(`${tabName}-tab`).classList.add('active');
        event.target.classList.add('active');
    }

    skipPosture() {
        const posture = this.sessionData.postures[this.currentPostureIndex];
        this.sessionData.skippedPostures.push({
            id: posture.id,
            name: posture.name,
            reason: 'skipped'
        });
        
        this.nextPosture();
    }

    completePosture() {
        // Limpiar timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Guardar notas
        const notes = document.getElementById('postureNotes')?.value;
        const posture = this.sessionData.postures[this.currentPostureIndex];
        
        this.sessionData.completedPostures.push({
            id: posture.id,
            name: posture.name,
            duration: posture.defaultDuration * 60 - this.timeRemaining,
            notes: notes
        });
        
        this.nextPosture();
    }

    nextPosture() {
        this.currentPostureIndex++;
        
        // Cerrar modal actual
        document.querySelector('.posture-modal')?.remove();
        
        if (this.currentPostureIndex < this.sessionData.postures.length) {
            // Mostrar mensaje de transición
            this.showTransitionMessage();
            
            // Mostrar siguiente postura después de 3 segundos
            setTimeout(() => {
                document.querySelector('.transition-message')?.remove();
                this.showPostureScreen();
            }, 3000);
        } else {
            // Sesión completada
            this.completeSession();
        }
    }

    showTransitionMessage() {
        const div = document.createElement('div');
        div.className = 'transition-message';
        div.innerHTML = `
            <div class="transition-content">
                <h3>¡Excelente trabajo!</h3>
                <p>Prepárate para la siguiente postura...</p>
                <div class="transition-countdown">3</div>
            </div>
        `;
        
        document.body.appendChild(div);
        
        // Countdown
        let count = 3;
        const countdownEl = div.querySelector('.transition-countdown');
        const countdown = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.textContent = count;
            } else {
                clearInterval(countdown);
            }
        }, 1000);
    }

    completeSession() {
        this.sessionData.endTime = new Date();
        
        // Mostrar evaluación post-sesión
        this.showPostSessionModal();
    }

    showPostSessionModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay post-session-modal';
        modal.innerHTML = `
            <div class="modal-content post-session-content">
                <div class="modal-header">
                    <h2>¡Sesión Completada! 🎉</h2>
                </div>
                
                <div class="session-summary">
                    <h3>Resumen de tu práctica</h3>
                    <div class="summary-stats">
                        <div class="stat">
                            <span class="stat-icon">✅</span>
                            <span class="stat-value">${this.sessionData.completedPostures.length}</span>
                            <span class="stat-label">Posturas completadas</span>
                        </div>
                        <div class="stat">
                            <span class="stat-icon">⏱️</span>
                            <span class="stat-value">${this.calculateTotalTime()}</span>
                            <span class="stat-label">Minutos de práctica</span>
                        </div>
                        <div class="stat">
                            <span class="stat-icon">🔥</span>
                            <span class="stat-value">${this.calculateCalories()}</span>
                            <span class="stat-label">Calorías aprox.</span>
                        </div>
                    </div>
                </div>
                
                <div class="post-assessment">
                    <h3>¿Cómo te sientes ahora?</h3>
                    
                    <div class="pain-assessment">
                        <label>Nivel de dolor/molestia (0-10)</label>
                        <div class="pain-scale">
                            ${Array.from({length: 11}, (_, i) => `
                                <button class="pain-level" data-level="${i}" 
                                    onclick="window.sessionManager.selectPainLevel(${i}, 'after')">
                                    ${i}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="mood-assessment">
                        <label>Estado de ánimo</label>
                        <div class="mood-options">
                            <button class="mood-option" data-mood="excellent" 
                                onclick="window.sessionManager.selectMood('excellent', 'after')">
                                😊 Excelente
                            </button>
                            <button class="mood-option" data-mood="good" 
                                onclick="window.sessionManager.selectMood('good', 'after')">
                                🙂 Bien
                            </button>
                            <button class="mood-option" data-mood="neutral" 
                                onclick="window.sessionManager.selectMood('neutral', 'after')">
                                😐 Normal
                            </button>
                            <button class="mood-option" data-mood="tired" 
                                onclick="window.sessionManager.selectMood('tired', 'after')">
                                😴 Cansado
                            </button>
                            <button class="mood-option" data-mood="energized" 
                                onclick="window.sessionManager.selectMood('energized', 'after')">
                                ⚡ Energizado
                            </button>
                        </div>
                    </div>
                    
                    <div class="session-rating">
                        <label>Califica esta sesión</label>
                        <div class="rating-stars">
                            ${Array.from({length: 5}, (_, i) => `
                                <button class="star" data-rating="${i + 1}" 
                                    onclick="window.sessionManager.rateSession(${i + 1})">
                                    ⭐
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="session-feedback">
                        <label>Comentarios sobre la sesión</label>
                        <textarea id="sessionFeedback" 
                            placeholder="¿Cómo fue tu experiencia? ¿Qué mejorarías?"></textarea>
                    </div>
                    
                    <div class="photo-capture">
                        <label>Foto final (opcional)</label>
                        <button class="btn-secondary" onclick="window.sessionManager.capturePhoto('final')">
                            📸 Tomar Foto
                        </button>
                        <div id="finalPhotoPreview" class="photo-preview"></div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-primary" id="saveSessionBtn" 
                        onclick="window.sessionManager.saveSession()" disabled>
                        💾 Guardar Sesión
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Habilitar botón cuando se complete evaluación
        this.checkPostSessionComplete();
    }

    rateSession(rating) {
        // Deseleccionar todas las estrellas
        document.querySelectorAll('.star').forEach((star, index) => {
            star.classList.toggle('selected', index < rating);
        });
        
        this.sessionData.rating = rating;
        this.checkPostSessionComplete();
    }

    checkPostSessionComplete() {
        const hasPostAssessment = this.sessionData.painAfter !== null && 
                                 this.sessionData.moodAfter !== null &&
                                 this.sessionData.rating;
        
        const saveBtn = document.getElementById('saveSessionBtn');
        if (saveBtn) {
            saveBtn.disabled = !hasPostAssessment;
        }
    }

    calculateTotalTime() {
        const start = this.sessionData.startTime;
        const end = this.sessionData.endTime;
        const diffMs = end - start;
        return Math.round(diffMs / 60000); // Convertir a minutos
    }

    calculateCalories() {
        // Estimación aproximada: 3-5 calorías por minuto de yoga
        const minutes = this.calculateTotalTime();
        return Math.round(minutes * 4);
    }

    async saveSession() {
        try {
            // Preparar datos de la sesión
            const sessionRecord = {
                userId: this.sessionData.userId,
                therapyId: this.sessionData.therapyId,
                therapyName: this.sessionData.therapyName,
                startTime: this.sessionData.startTime,
                endTime: this.sessionData.endTime,
                duration: this.calculateTotalTime(),
                painBefore: this.sessionData.painBefore,
                painAfter: this.sessionData.painAfter,
                painImprovement: this.sessionData.painBefore - this.sessionData.painAfter,
                moodBefore: this.sessionData.moodBefore,
                moodAfter: this.sessionData.moodAfter,
                rating: this.sessionData.rating,
                feedback: document.getElementById('sessionFeedback')?.value || '',
                completedPostures: this.sessionData.completedPostures.length,
                skippedPostures: this.sessionData.skippedPostures.length,
                totalPostures: this.sessionData.postures.length,
                caloriesBurned: this.calculateCalories(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Guardar fotos si existen
            if (this.sessionData.photos.initial || this.sessionData.photos.final) {
                // TODO: Subir fotos a Firebase Storage
                console.log('[SessionManager] Fotos pendientes de subir');
            }
            
            // Guardar en Firestore
            const docRef = await firebase.firestore().collection('sessions').add(sessionRecord);
            
            console.log('[SessionManager] Sesión guardada:', docRef.id);
            
            // Actualizar estadísticas del usuario
            await this.updateUserStats();
            
            // Cerrar modal
            document.querySelector('.post-session-modal').remove();
            
            // Mostrar notificación de éxito
            this.showCompletionCelebration();
            
            // Volver al dashboard después de 3 segundos
            setTimeout(() => {
                window.location.reload();
            }, 3000);
            
        } catch (error) {
            console.error('[SessionManager] Error guardando sesión:', error);
            window.showError('Error al guardar la sesión');
        }
    }

    async updateUserStats() {
        try {
            const userRef = firebase.firestore().collection('users').doc(this.sessionData.userId);
            
            await userRef.update({
                sessionsCompleted: firebase.firestore.FieldValue.increment(1),
                totalSessionTime: firebase.firestore.FieldValue.increment(this.calculateTotalTime()),
                lastSessionDate: firebase.firestore.FieldValue.serverTimestamp(),
                currentPainLevel: this.sessionData.painAfter
            });
            
        } catch (error) {
            console.error('[SessionManager] Error actualizando estadísticas:', error);
        }
    }

    showCompletionCelebration() {
        const celebration = document.createElement('div');
        celebration.className = 'celebration-overlay';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <h2>¡Excelente trabajo!</h2>
                <p>Has completado tu sesión exitosamente</p>
                <div class="improvement-badge">
                    ${this.sessionData.painBefore > this.sessionData.painAfter ? 
                        `<span class="improvement">↓ ${this.sessionData.painBefore - this.sessionData.painAfter} puntos de dolor</span>` :
                        '<span>Mantén la práctica constante</span>'
                    }
                </div>
                <div class="confetti"></div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // Animación de confetti
        this.createConfetti();
    }

    createConfetti() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#BB8FCE'];
        const confettiContainer = document.querySelector('.confetti');
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confettiContainer.appendChild(confetti);
        }
    }

    pauseSession() {
        // TODO: Implementar pausa de sesión completa
        if (confirm('¿Deseas pausar la sesión? Podrás continuarla más tarde.')) {
            window.showInfo('Sesión pausada. Puedes continuarla desde el dashboard.');
            window.location.reload();
        }
    }

    playSound(type) {
        // Reproducir sonidos de notificación
        const audio = new Audio();
        switch(type) {
            case '30-seconds':
                // Sonido suave de campana
                audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDD3...'
                break;
            case '10-seconds':
                // Sonido más urgente
                audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJH...'
                break;
            case 'complete':
                // Sonido de celebración
                audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAS7AAAI2wAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LM...'
                break;
        }
        
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Crear instancia global
window.sessionManager = new SessionManager();

console.log('[SessionManager] Módulo de gestión de sesiones cargado');