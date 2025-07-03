// Módulo de Gestión de Terapias - SoftZen v2.1
// Sistema completo de creación y edición de series terapéuticas con drag & drop

class TherapyManager {
    constructor() {
        this.currentSeries = null;
        this.selectedPostures = [];
        this.draggedElement = null;
        this.isEditing = false;
        this.isInitialized = false;
    }

    init() {
        console.log('[TherapyManager] Inicializando gestor de terapias...');
        
        // Configurar eventos
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('[TherapyManager] Gestor inicializado');
    }

    setupEventListeners() {
        // Eventos globales de drag & drop
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
        document.addEventListener('dragleave', this.handleDragLeave.bind(this));
    }

    // Mostrar modal de creación de terapia
    showCreateTherapyModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content therapy-creation-modal">
                <div class="modal-header">
                    <h2>Crear Nueva Serie Terapéutica</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                
                <div class="therapy-creation-content">
                    <!-- Paso 1: Información Básica -->
                    <div class="creation-step active" id="step1">
                        <h3>1. Información Básica</h3>
                        <form id="therapyBasicInfo">
                            <div class="form-group">
                                <label for="seriesName">Nombre de la Serie</label>
                                <input type="text" id="seriesName" class="form-input" 
                                    placeholder="Ej: Alivio de Estrés Matutino" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="seriesDescription">Descripción</label>
                                <textarea id="seriesDescription" class="form-textarea" 
                                    placeholder="Describe el objetivo y beneficios de esta serie" 
                                    rows="3" required></textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="therapyType">Tipo de Terapia</label>
                                    <select id="therapyType" class="form-select" required>
                                        <option value="">Selecciona un tipo</option>
                                        <option value="anxiety">Ansiedad y Estrés</option>
                                        <option value="back_pain">Dolor de Espalda</option>
                                        <option value="arthritis">Artritis</option>
                                        <option value="general">Bienestar General</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="difficulty">Nivel de Dificultad</label>
                                    <select id="difficulty" class="form-select" required>
                                        <option value="">Selecciona nivel</option>
                                        <option value="principiante">Principiante</option>
                                        <option value="intermedio">Intermedio</option>
                                        <option value="avanzado">Avanzado</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="targetCondition">Condiciones Objetivo</label>
                                <input type="text" id="targetCondition" class="form-input" 
                                    placeholder="Ej: Dolor lumbar crónico, ansiedad generalizada">
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-primary" onclick="window.therapyManager.nextStep(2)">
                                    Siguiente →
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Paso 2: Selección de Posturas -->
                    <div class="creation-step" id="step2" style="display:none;">
                        <h3>2. Seleccionar Posturas</h3>
                        
                        <div class="postures-selector">
                            <div class="available-postures">
                                <h4>Posturas Disponibles</h4>
                                <div class="posture-filters">
                                    <input type="text" class="search-input" 
                                        placeholder="Buscar posturas..." 
                                        onkeyup="window.therapyManager.filterPostures(this.value)">
                                    <select class="filter-select" 
                                        onchange="window.therapyManager.filterByType(this.value)">
                                        <option value="">Todas las categorías</option>
                                        <option value="anxiety">Ansiedad</option>
                                        <option value="back_pain">Dolor de Espalda</option>
                                        <option value="arthritis">Artritis</option>
                                    </select>
                                </div>
                                <div class="postures-list" id="availablePostures">
                                    ${this.renderAvailablePostures()}
                                </div>
                            </div>
                            
                            <div class="series-builder">
                                <h4>Serie Terapéutica</h4>
                                <div class="series-info">
                                    <span>Duración total: <strong id="totalDuration">0</strong> min</span>
                                    <span>Posturas: <strong id="postureCount">0</strong></span>
                                </div>
                                <div class="selected-postures drop-zone" id="selectedPostures">
                                    <p class="empty-message">Arrastra las posturas aquí para añadirlas a la serie</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="window.therapyManager.nextStep(1)">
                                ← Anterior
                            </button>
                            <button type="button" class="btn-primary" onclick="window.therapyManager.nextStep(3)"
                                    id="step2NextBtn" disabled>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                    
                    <!-- Paso 3: Configuración Final -->
                    <div class="creation-step" id="step3" style="display:none;">
                        <h3>3. Configuración Final</h3>
                        
                        <div class="series-preview" id="seriesPreview">
                            <!-- Vista previa de la serie -->
                        </div>
                        
                        <form id="therapyFinalConfig">
                            <div class="form-group">
                                <label for="sessionDuration">Duración de cada sesión (minutos)</label>
                                <input type="number" id="sessionDuration" class="form-input" 
                                    min="15" max="120" value="30">
                            </div>
                            
                            <div class="form-group">
                                <label for="sessionsPerWeek">Sesiones recomendadas por semana</label>
                                <input type="number" id="sessionsPerWeek" class="form-input" 
                                    min="1" max="7" value="3">
                            </div>
                            
                            <div class="form-group">
                                <label for="instructorNotes">Notas del Instructor</label>
                                <textarea id="instructorNotes" class="form-textarea" 
                                    placeholder="Recomendaciones, precauciones o adaptaciones especiales" 
                                    rows="4"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="isPublic">
                                    Hacer esta serie pública (disponible para todos los pacientes)
                                </label>
                            </div>
                        </form>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="window.therapyManager.nextStep(2)">
                                ← Anterior
                            </button>
                            <button type="button" class="btn-primary" onclick="window.therapyManager.saveSeries()">
                                💾 Guardar Serie
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Inicializar componentes
        this.currentSeries = {
            postures: [],
            totalDuration: 0
        };
        
        this.updateSeriesInfo();
    }

    renderAvailablePostures() {
        const allPostures = [];
        
        // Obtener todas las posturas de THERAPY_DATA
        if (window.THERAPY_DATA) {
            Object.values(window.THERAPY_DATA).forEach(therapy => {
                therapy.postures.forEach(posture => {
                    allPostures.push({
                        ...posture,
                        therapyType: therapy.id,
                        therapyName: therapy.name
                    });
                });
            });
        }
        
        return allPostures.map(posture => `
            <div class="posture-card draggable" draggable="true" data-posture='${JSON.stringify(posture)}'>
                <div class="posture-image">
                    <img src="${posture.image}" alt="${posture.name}" loading="lazy">
                </div>
                <div class="posture-info">
                    <h5>${posture.name}</h5>
                    <p class="sanskrit">${posture.sanskrit}</p>
                    <div class="posture-meta">
                        <span class="duration">⏱️ ${posture.defaultDuration} min</span>
                        <span class="difficulty ${posture.difficulty}">${posture.difficulty}</span>
                    </div>
                    <p class="posture-benefits">${posture.benefits.substring(0, 80)}...</p>
                </div>
            </div>
        `).join('');
    }

    // Drag & Drop handlers
    handleDragStart(e) {
        if (e.target.classList.contains('draggable')) {
            this.draggedElement = e.target;
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.innerHTML);
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        const dropZone = e.target.closest('.drop-zone');
        if (dropZone) {
            e.dataTransfer.dropEffect = 'move';
            dropZone.classList.add('drag-over');
            
            // Visual feedback para el orden
            const afterElement = this.getDragAfterElement(dropZone, e.clientY);
            if (afterElement == null) {
                dropZone.appendChild(this.draggedElement);
            } else {
                dropZone.insertBefore(this.draggedElement, afterElement);
            }
        }
    }

    handleDragLeave(e) {
        const dropZone = e.target.closest('.drop-zone');
        if (dropZone && !dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const dropZone = e.target.closest('.drop-zone');
        
        if (dropZone && this.draggedElement) {
            dropZone.classList.remove('drag-over');
            
            // Si es una nueva postura
            if (this.draggedElement.classList.contains('posture-card')) {
                const postureData = JSON.parse(this.draggedElement.dataset.posture);
                this.addPostureToSeries(postureData, dropZone);
            }
            
            // Actualizar orden
            this.updateSeriesOrder();
        }
    }

    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.draggedElement = null;
        }
        
        // Limpiar clases de drag-over
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.series-posture:not(.dragging)')];
        
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

    addPostureToSeries(posture, dropZone) {
        // Verificar si ya existe
        if (this.currentSeries.postures.find(p => p.id === posture.id)) {
            window.showWarning('Esta postura ya está en la serie');
            return;
        }
        
        // Añadir a la serie
        this.currentSeries.postures.push(posture);
        
        // Crear elemento en la serie
        const postureElement = document.createElement('div');
        postureElement.className = 'series-posture draggable';
        postureElement.draggable = true;
        postureElement.dataset.postureId = posture.id;
        postureElement.innerHTML = `
            <div class="posture-order">${this.currentSeries.postures.length}</div>
            <img src="${posture.image}" alt="${posture.name}">
            <div class="posture-details">
                <h5>${posture.name}</h5>
                <p>${posture.sanskrit} - ${posture.defaultDuration} min</p>
                <p class="mini-benefits">${posture.benefits.substring(0, 60)}...</p>
            </div>
            <div class="posture-controls">
                <input type="number" class="duration-input" value="${posture.defaultDuration}" 
                    min="1" max="30" onchange="window.therapyManager.updatePostureDuration(${posture.id}, this.value)">
                <button class="btn-remove" onclick="window.therapyManager.removePosture(${posture.id})">
                    🗑️
                </button>
            </div>
        `;
        
        // Limpiar mensaje vacío
        const emptyMessage = dropZone.querySelector('.empty-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        dropZone.appendChild(postureElement);
        
        // Actualizar información
        this.updateSeriesInfo();
        
        // Habilitar botón siguiente
        document.getElementById('step2NextBtn').disabled = false;
    }

    removePosture(postureId) {
        // Remover de la serie
        this.currentSeries.postures = this.currentSeries.postures.filter(p => p.id !== postureId);
        
        // Remover del DOM
        const element = document.querySelector(`[data-posture-id="${postureId}"]`);
        if (element) {
            element.remove();
        }
        
        // Si no quedan posturas, mostrar mensaje vacío
        const dropZone = document.getElementById('selectedPostures');
        if (this.currentSeries.postures.length === 0) {
            dropZone.innerHTML = '<p class="empty-message">Arrastra las posturas aquí para añadirlas a la serie</p>';
            document.getElementById('step2NextBtn').disabled = true;
        }
        
        // Actualizar información y reordenar
        this.updateSeriesOrder();
        this.updateSeriesInfo();
    }

    updatePostureDuration(postureId, newDuration) {
        const posture = this.currentSeries.postures.find(p => p.id === postureId);
        if (posture) {
            posture.customDuration = parseInt(newDuration);
            this.updateSeriesInfo();
        }
    }

    updateSeriesOrder() {
        const postureElements = document.querySelectorAll('.series-posture');
        const newOrder = [];
        
        postureElements.forEach((element, index) => {
            const postureId = parseInt(element.dataset.postureId);
            const posture = this.currentSeries.postures.find(p => p.id === postureId);
            if (posture) {
                newOrder.push(posture);
                // Actualizar número de orden
                const orderElement = element.querySelector('.posture-order');
                if (orderElement) {
                    orderElement.textContent = index + 1;
                }
            }
        });
        
        this.currentSeries.postures = newOrder;
    }

    updateSeriesInfo() {
        // Calcular duración total
        const totalDuration = this.currentSeries.postures.reduce((total, p) => {
            return total + (p.customDuration || p.defaultDuration);
        }, 0);
        
        this.currentSeries.totalDuration = totalDuration;
        
        // Actualizar UI
        const durationElement = document.getElementById('totalDuration');
        const countElement = document.getElementById('postureCount');
        
        if (durationElement) durationElement.textContent = totalDuration;
        if (countElement) countElement.textContent = this.currentSeries.postures.length;
    }

    filterPostures(searchTerm) {
        const postureCards = document.querySelectorAll('.posture-card');
        const term = searchTerm.toLowerCase();
        
        postureCards.forEach(card => {
            const postureData = JSON.parse(card.dataset.posture);
            const matches = postureData.name.toLowerCase().includes(term) ||
                           postureData.sanskrit.toLowerCase().includes(term) ||
                           postureData.benefits.toLowerCase().includes(term);
            
            card.style.display = matches ? 'flex' : 'none';
        });
    }

    filterByType(therapyType) {
        const postureCards = document.querySelectorAll('.posture-card');
        
        postureCards.forEach(card => {
            const postureData = JSON.parse(card.dataset.posture);
            
            if (!therapyType || postureData.therapyType === therapyType) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    nextStep(step) {
        // Validar paso actual antes de avanzar
        if (step === 2 && !this.validateStep1()) {
            return;
        }
        
        if (step === 3) {
            this.preparePreview();
        }
        
        // Ocultar todos los pasos
        document.querySelectorAll('.creation-step').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        
        // Mostrar paso solicitado
        const stepElement = document.getElementById(`step${step}`);
        if (stepElement) {
            stepElement.style.display = 'block';
            stepElement.classList.add('active');
        }
    }

    validateStep1() {
        const name = document.getElementById('seriesName').value.trim();
        const description = document.getElementById('seriesDescription').value.trim();
        const type = document.getElementById('therapyType').value;
        const difficulty = document.getElementById('difficulty').value;
        
        if (!name || !description || !type || !difficulty) {
            window.showError('Por favor completa todos los campos requeridos');
            return false;
        }
        
        // Guardar datos
        this.currentSeries.name = name;
        this.currentSeries.description = description;
        this.currentSeries.therapyType = type;
        this.currentSeries.difficulty = difficulty;
        this.currentSeries.targetCondition = document.getElementById('targetCondition').value.trim();
        
        return true;
    }

    preparePreview() {
        const preview = document.getElementById('seriesPreview');
        
        preview.innerHTML = `
            <h4>${this.currentSeries.name}</h4>
            <p>${this.currentSeries.description}</p>
            <div class="series-summary">
                <span><strong>Tipo:</strong> ${this.getTherapyTypeName(this.currentSeries.therapyType)}</span>
                <span><strong>Nivel:</strong> ${this.currentSeries.difficulty}</span>
                <span><strong>Duración total:</strong> ${this.currentSeries.totalDuration} minutos</span>
                <span><strong>Posturas:</strong> ${this.currentSeries.postures.length}</span>
            </div>
            <div class="postures-preview">
                <h5>Secuencia de Posturas:</h5>
                <div class="preview-grid">
                    ${this.currentSeries.postures.map((p, i) => `
                        <div class="preview-posture">
                            <span class="order">${i + 1}</span>
                            <img src="${p.image}" alt="${p.name}">
                            <p>${p.name}</p>
                            <span class="duration">${p.customDuration || p.defaultDuration} min</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getTherapyTypeName(type) {
        const types = {
            anxiety: 'Ansiedad y Estrés',
            back_pain: 'Dolor de Espalda',
            arthritis: 'Artritis',
            general: 'Bienestar General'
        };
        return types[type] || type;
    }

    async saveSeries() {
        try {
            // Recopilar todos los datos
            const seriesData = {
                ...this.currentSeries,
                sessionDuration: parseInt(document.getElementById('sessionDuration').value),
                sessionsPerWeek: parseInt(document.getElementById('sessionsPerWeek').value),
                instructorNotes: document.getElementById('instructorNotes').value.trim(),
                isPublic: document.getElementById('isPublic').checked,
                createdBy: firebase.auth().currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                postureIds: this.currentSeries.postures.map(p => ({
                    id: p.id,
                    duration: p.customDuration || p.defaultDuration
                }))
            };
            
            // Guardar en Firebase
            const docRef = await firebase.firestore().collection('therapy_series').add(seriesData);
            
            console.log('[TherapyManager] Serie guardada con ID:', docRef.id);
            
            // Cerrar modal
            document.querySelector('.modal-overlay').remove();
            
            // Notificar éxito
            window.notificationSystem?.show({
                type: 'success',
                title: '¡Serie Creada!',
                message: `La serie "${seriesData.name}" se ha creado exitosamente`,
                duration: 5000
            });
            
            // Actualizar lista de terapias si estamos en esa sección
            if (window.dashboardModule && window.dashboardModule.currentSection === 'therapies') {
                window.dashboardModule.renderTherapies();
            }
            
        } catch (error) {
            console.error('[TherapyManager] Error guardando serie:', error);
            window.showError('Error al guardar la serie. Por favor intenta de nuevo.');
        }
    }

    // Asignar terapia a paciente
    async assignTherapyToPatient(patientId, seriesId) {
        try {
            const assignmentData = {
                patientId: patientId,
                seriesId: seriesId,
                assignedBy: firebase.auth().currentUser.uid,
                assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active',
                progress: 0,
                completedSessions: 0
            };
            
            await firebase.firestore().collection('therapy_assignments').add(assignmentData);
            
            window.showSuccess('Terapia asignada exitosamente');
            
        } catch (error) {
            console.error('[TherapyManager] Error asignando terapia:', error);
            window.showError('Error al asignar la terapia');
        }
    }

    // Editar serie existente
    async editSeries(seriesId) {
        try {
            const doc = await firebase.firestore().collection('therapy_series').doc(seriesId).get();
            
            if (!doc.exists) {
                window.showError('Serie no encontrada');
                return;
            }
            
            const seriesData = doc.data();
            this.currentSeries = {
                id: seriesId,
                ...seriesData
            };
            
            this.isEditing = true;
            this.showCreateTherapyModal();
            
            // Prellenar formulario con datos existentes
            document.getElementById('seriesName').value = seriesData.name;
            document.getElementById('seriesDescription').value = seriesData.description;
            document.getElementById('therapyType').value = seriesData.therapyType;
            document.getElementById('difficulty').value = seriesData.difficulty;
            document.getElementById('targetCondition').value = seriesData.targetCondition || '';
            
            // Cargar posturas existentes
            // TODO: Implementar carga de posturas para edición
            
        } catch (error) {
            console.error('[TherapyManager] Error cargando serie para edición:', error);
            window.showError('Error al cargar la serie');
        }
    }
}

// Crear instancia global
window.therapyManager = new TherapyManager();

console.log('[TherapyManager] Módulo de gestión de terapias cargado');