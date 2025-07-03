// ===================================================================
// NOTIFICATIONS SYSTEM - SOFTZEN V2.1
// Sistema de notificaciones visuales atractivas
// ===================================================================

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }
    
    init() {
        // Crear contenedor de notificaciones si no existe
        if (!document.getElementById('notifications-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notifications-container';
            this.container.className = 'notifications-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notifications-container');
        }
    }
    
    show(options) {
        const notification = {
            id: Date.now() + Math.random(),
            type: options.type || 'info',
            title: options.title || '',
            message: options.message || '',
            duration: options.duration || 5000,
            actions: options.actions || [],
            icon: this.getIcon(options.type || 'info'),
            progress: options.progress !== false
        };
        
        this.notifications.push(notification);
        this.render(notification);
        
        // Auto cerrar si tiene duración
        if (notification.duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
        }
        
        return notification.id;
    }
    
    render(notification) {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification notification-${notification.type}`;
        notificationEl.id = `notification-${notification.id}`;
        notificationEl.setAttribute('data-notification-id', notification.id);
        
        notificationEl.innerHTML = `
            <div class="notification-header">
                <span class="notification-icon">${notification.icon}</span>
                <div class="notification-content">
                    ${notification.title ? `<h4 class="notification-title">${notification.title}</h4>` : ''}
                    <p class="notification-message">${notification.message}</p>
                </div>
                <button class="notification-close" onclick="notificationSystem.remove(${notification.id})">×</button>
            </div>
            ${notification.actions.length > 0 ? `
                <div class="notification-actions">
                    ${notification.actions.map(action => `
                        <button class="notification-action ${action.class || ''}" 
                                onclick="${action.onClick}; notificationSystem.remove(${notification.id})">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
            ${notification.progress ? `
                <div class="notification-progress">
                    <div class="notification-progress-bar" style="animation-duration: ${notification.duration}ms"></div>
                </div>
            ` : ''}
        `;
        
        this.container.appendChild(notificationEl);
        
        // Animación de entrada
        setTimeout(() => {
            notificationEl.classList.add('show');
        }, 10);
        
        // Efecto de sonido
        this.playSound(notification.type);
    }
    
    remove(id) {
        const notificationEl = document.querySelector(`[data-notification-id="${id}"]`);
        if (notificationEl) {
            notificationEl.classList.remove('show');
            notificationEl.classList.add('hide');
            
            setTimeout(() => {
                notificationEl.remove();
                this.notifications = this.notifications.filter(n => n.id !== id);
            }, 300);
        }
    }
    
    getIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️',
            'achievement': '🏆',
            'milestone': '🎯',
            'welcome': '👋',
            'tip': '💡',
            'notification': '🔔'
        };
        return icons[type] || icons.info;
    }
    
    playSound(type) {
        // Crear sonidos usando Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Configurar frecuencias según el tipo
            switch(type) {
                case 'success':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
                    break;
                case 'error':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1);
                    break;
                case 'warning':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.1);
                    break;
                default:
                    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            }
            
            // Configurar volumen
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
            
            // Reproducir
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Silenciar errores de audio
        }
    }
    
    // Métodos de conveniencia
    success(message, title = 'Éxito', duration = 3000) {
        return this.show({ type: 'success', title, message, duration });
    }
    
    error(message, title = 'Error', duration = 5000) {
        return this.show({ type: 'error', title, message, duration });
    }
    
    warning(message, title = 'Advertencia', duration = 4000) {
        return this.show({ type: 'warning', title, message, duration });
    }
    
    info(message, title = 'Información', duration = 4000) {
        return this.show({ type: 'info', title, message, duration });
    }
    
    achievement(message, title = 'Logro Desbloqueado') {
        return this.show({ 
            type: 'achievement', 
            title, 
            message, 
            duration: 6000,
            progress: true
        });
    }
    
    milestone(message, title = 'Meta Alcanzada') {
        return this.show({ 
            type: 'milestone', 
            title, 
            message, 
            duration: 6000,
            progress: true
        });
    }
    
    welcome(userName) {
        return this.show({
            type: 'welcome',
            title: `¡Bienvenido ${userName}!`,
            message: 'Es un placer tenerte de vuelta en SoftZen',
            duration: 4000
        });
    }
    
    sessionReminder(sessionNumber) {
        return this.show({
            type: 'info',
            title: '🧘‍♀️ Recordatorio de Sesión',
            message: `Es hora de tu sesión #${sessionNumber}. ¿Estás listo para comenzar?`,
            duration: 0,
            actions: [
                {
                    text: 'Comenzar Ahora',
                    class: 'btn-primary',
                    onClick: 'window.dashboardModule.startSession()'
                },
                {
                    text: 'Más Tarde',
                    class: 'btn-secondary',
                    onClick: 'console.log("Sesión pospuesta")'
                }
            ]
        });
    }
    
    progressUpdate(current, total, type = 'Sesiones') {
        const percentage = Math.round((current / total) * 100);
        return this.show({
            type: 'info',
            title: '📊 Actualización de Progreso',
            message: `Has completado ${current} de ${total} ${type} (${percentage}%)`,
            duration: 4000
        });
    }
    
    painImprovement(before, after) {
        const improvement = before - after;
        if (improvement > 0) {
            return this.show({
                type: 'success',
                title: '📉 ¡Excelente Progreso!',
                message: `Tu dolor se redujo en ${improvement} puntos. ¡Sigue así!`,
                duration: 5000
            });
        } else if (improvement < 0) {
            return this.show({
                type: 'warning',
                title: '📈 Monitoreo de Dolor',
                message: `Tu dolor aumentó en ${Math.abs(improvement)} puntos. Considera hablar con tu instructor.`,
                duration: 6000
            });
        } else {
            return this.show({
                type: 'info',
                title: '➖ Sin Cambios',
                message: 'Tu nivel de dolor se mantuvo igual.',
                duration: 4000
            });
        }
    }
}

// Estilos CSS para las notificaciones
const notificationStyles = `
.notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    pointer-events: none;
}

.notification {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    margin-bottom: 15px;
    min-width: 320px;
    max-width: 420px;
    transform: translateX(500px);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    pointer-events: all;
    overflow: hidden;
}

.notification.show {
    transform: translateX(0);
}

.notification.hide {
    transform: translateX(500px);
    opacity: 0;
}

.notification-header {
    padding: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.notification-icon {
    font-size: 24px;
    flex-shrink: 0;
}

.notification-content {
    flex: 1;
}

.notification-title {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
}

.notification-message {
    margin: 0;
    font-size: 14px;
    color: #4a5568;
    line-height: 1.5;
}

.notification-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #a0aec0;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.notification-close:hover {
    background: #f7fafc;
    color: #4a5568;
}

.notification-actions {
    padding: 0 16px 16px 16px;
    display: flex;
    gap: 8px;
}

.notification-action {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.notification-action.btn-primary {
    background: #667eea;
    color: white;
}

.notification-action.btn-primary:hover {
    background: #5a67d8;
}

.notification-action.btn-secondary {
    background: #e2e8f0;
    color: #4a5568;
}

.notification-action.btn-secondary:hover {
    background: #cbd5e0;
}

.notification-progress {
    height: 3px;
    background: #e2e8f0;
    position: relative;
    overflow: hidden;
}

.notification-progress-bar {
    height: 100%;
    background: currentColor;
    width: 100%;
    animation: progress linear forwards;
}

@keyframes progress {
    from { transform: translateX(0); }
    to { transform: translateX(-100%); }
}

/* Tipos de notificación */
.notification-success {
    border-left: 4px solid #48bb78;
}

.notification-success .notification-icon {
    color: #48bb78;
}

.notification-success .notification-progress-bar {
    background: #48bb78;
}

.notification-error {
    border-left: 4px solid #f56565;
}

.notification-error .notification-icon {
    color: #f56565;
}

.notification-error .notification-progress-bar {
    background: #f56565;
}

.notification-warning {
    border-left: 4px solid #ed8936;
}

.notification-warning .notification-icon {
    color: #ed8936;
}

.notification-warning .notification-progress-bar {
    background: #ed8936;
}

.notification-info {
    border-left: 4px solid #4299e1;
}

.notification-info .notification-icon {
    color: #4299e1;
}

.notification-info .notification-progress-bar {
    background: #4299e1;
}

.notification-achievement {
    border-left: 4px solid #9f7aea;
    background: linear-gradient(135deg, #faf5ff 0%, #e9d8fd 100%);
}

.notification-achievement .notification-icon {
    color: #9f7aea;
    animation: bounce 1s infinite;
}

.notification-achievement .notification-progress-bar {
    background: #9f7aea;
}

.notification-milestone {
    border-left: 4px solid #f6ad55;
    background: linear-gradient(135deg, #fffaf0 0%, #fed7aa 100%);
}

.notification-milestone .notification-icon {
    color: #f6ad55;
    animation: pulse 2s infinite;
}

.notification-milestone .notification-progress-bar {
    background: #f6ad55;
}

.notification-welcome {
    border-left: 4px solid #667eea;
    background: linear-gradient(135deg, #ebf4ff 0%, #c3dafe 100%);
}

.notification-welcome .notification-icon {
    animation: wave 0.5s ease-in-out;
}

.notification-welcome .notification-progress-bar {
    background: #667eea;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

@keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
}

/* Responsive */
@media (max-width: 480px) {
    .notifications-container {
        top: 10px;
        right: 10px;
        left: 10px;
    }
    
    .notification {
        min-width: auto;
        max-width: none;
    }
}
`;

// Inyectar estilos
if (!document.getElementById('notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
}

// Crear instancia global
window.notificationSystem = new NotificationSystem();

// Funciones de conveniencia globales
window.showNotification = (options) => window.notificationSystem.show(options);
window.showSuccess = (message, title) => window.notificationSystem.success(message, title);
window.showError = (message, title) => window.notificationSystem.error(message, title);
window.showWarning = (message, title) => window.notificationSystem.warning(message, title);
window.showInfo = (message, title) => window.notificationSystem.info(message, title);

console.log('🔔 Sistema de Notificaciones v2.1 cargado');