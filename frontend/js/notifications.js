// Sistema de Notificaciones Avanzado - SoftZen v2.1
// Sistema visual atractivo con sonidos, animaciones y múltiples tipos

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.soundEnabled = true;
        this.maxNotifications = 5;
        this.init();
    }

    init() {
        this.createContainer();
        this.loadSounds();
        console.log('[Notifications] Sistema de notificaciones inicializado');
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    loadSounds() {
        this.sounds = {
            success: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGLHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGLHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGLHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGJm6x7eOYUQsPaLLp6bJdGAY+ltryxnkpBS1+zfHZizcIGWi78+eeTQwMUKfj8LZjHAY4kdfyznUoByByxvDdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBiw='),
            error: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGLHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGLHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGLHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGJm6x7eOYUQsPaLLp6bJdGAY+ltryxnkpBS1+zfHZizcIGWi78+eeTQwMUKfj8LZjHAY4kdfyznUoByByxvDdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBiw='),
            warning: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGLHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGLHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGLHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGJm6x7eOYUQsPaLLp6bJdGAY+ltryxnkpBS1+zfHZizcIGWi78+eeTQwMUKfj8LZjHAY4kdfyznUoByByxvDdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBiw='),
            info: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGLHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGLHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGLHfH8N2QQAoUXrTp66hVFApGn+DyvmMUAjiF0fPTfjEGJm6x7eOYUQsPaLLp6bJdGAY+ltryxnkpBS1+zfHZizcIGWi78+eeTQwMUKfj8LZjHAY4kdfyznUoByByxvDdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBix3x/DdkEAKFF606OmqVRUKRp/g8r5jFAM4hdHz034xBiw=')
        };
    }

    createSound(base64Data) {
        try {
            const audio = new Audio(base64Data);
            audio.volume = 0.3;
            return audio;
        } catch (e) {
            console.warn('[Notifications] Error creando sonido:', e);
            return null;
        }
    }

    show(options = {}) {
        const notification = this.createNotification(options);
        this.addNotification(notification);
        this.playSound(options.type);
        
        // Auto remove después del duration
        const duration = options.duration || 5000;
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);

        return notification.id;
    }

    createNotification(options) {
        const id = 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const type = options.type || 'info';
        const message = options.message || '';
        const title = options.title || this.getDefaultTitle(type);
        const icon = options.icon || this.getDefaultIcon(type);
        const actions = options.actions || [];

        const notificationEl = document.createElement('div');
        notificationEl.className = `notification notification-${type}`;
        notificationEl.setAttribute('data-id', id);

        notificationEl.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-icon">${icon}</span>
                    <span class="notification-title">${title}</span>
                    <button class="notification-close" data-notification-id="${id}">&times;</button>
                </div>
                <div class="notification-message">${message}</div>
                ${actions.length > 0 ? `
                    <div class="notification-actions">
                        ${actions.map(action => `
                            <button class="notification-action-btn" onclick="${action.onClick}">${action.text}</button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="notification-progress"></div>
        `;

        // Agregar evento de cierre directamente al botón
        const closeBtn = notificationEl.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeNotification(id);
            });
        }

        const notification = {
            id,
            element: notificationEl,
            type,
            timestamp: Date.now()
        };

        return notification;
    }


    getDefaultTitle(type) {
        const titles = {
            success: '¡Éxito!',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información',
            achievement: '¡Logro Desbloqueado!',
            session: 'Sesión de Yoga',
            reminder: 'Recordatorio'
        };
        return titles[type] || 'SoftZen';
    }

    getDefaultIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            achievement: '🏆',
            session: '🧘‍♀️',
            reminder: '🔔'
        };
        return icons[type] || 'ℹ️';
    }

    addNotification(notification) {
        // Limitar número máximo de notificaciones
        if (this.notifications.length >= this.maxNotifications) {
            this.removeNotification(this.notifications[0].id);
        }

        this.notifications.push(notification);
        this.container.appendChild(notification.element);

        // Animar entrada
        setTimeout(() => {
            notification.element.classList.add('notification-enter');
        }, 10);
    }

    removeNotification(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index === -1) return;

        const notification = this.notifications[index];
        
        // Animar salida
        notification.element.classList.add('notification-exit');
        
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.splice(index, 1);
        }, 300);
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        
        const sound = this.sounds[type] || this.sounds.info;
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.warn('[Notifications] Error reproduciendo sonido:', e);
            });
        }
    }

    clear() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification.id);
        });
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }

    // Notificaciones específicas para la aplicación
    showAchievement(title, message, data = {}) {
        return this.show({
            type: 'achievement',
            title,
            message,
            duration: 8000,
            actions: data.actions || []
        });
    }

    showSessionComplete(sessionData) {
        const improvementText = sessionData.painImprovement > 0 
            ? `¡Mejoraste tu dolor en ${sessionData.painImprovement} puntos!`
            : 'Sesión completada exitosamente';

        return this.show({
            type: 'session',
            title: 'Sesión Completada',
            message: improvementText,
            duration: 6000,
            actions: [
                {
                    text: 'Ver Progreso',
                    onClick: 'window.dashboardModule.showProgress()'
                }
            ]
        });
    }

    showReminder(message, data = {}) {
        return this.show({
            type: 'reminder',
            title: 'Recordatorio',
            message,
            duration: 10000,
            actions: data.actions || []
        });
    }

    showConnectionStatus(isOnline) {
        const type = isOnline ? 'success' : 'warning';
        const message = isOnline ? 'Conexión restaurada' : 'Sin conexión a internet';
        
        return this.show({
            type,
            message,
            duration: 3000
        });
    }
}

// Hacer disponible globalmente
window.NotificationSystem = NotificationSystem;

// Auto-inicializar si DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.notificationSystem) {
            window.notificationSystem = new NotificationSystem();
        }
    });
} else {
    if (!window.notificationSystem) {
        window.notificationSystem = new NotificationSystem();
    }
}

console.log('[Notifications] Sistema de notificaciones avanzado cargado');