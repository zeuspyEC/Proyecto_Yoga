# 🧘‍♀️ SoftZen - Yoga Terapéutico Optimizado

Sistema profesional de gestión de yoga terapéutico con seguimiento personalizado de progreso, gestión de pacientes y análisis de resultados.

![SoftZen Logo](https://img.shields.io/badge/SoftZen-v2.1-purple?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMiAydjIwIi8+PHBhdGggZD0iTTIgMTJoMjAiLz48L3N2Zz4=)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API](#-api)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

### Para Instructores
- 📊 **Dashboard Completo**: KPIs en tiempo real, métricas de progreso y análisis detallado
- 👥 **Gestión de Pacientes**: Registro completo, asignación de series y seguimiento individual
- 🧘‍♀️ **Creación de Series**: Editor visual con drag & drop para organizar posturas
- 📈 **Reportes Avanzados**: Exportación de datos, gráficos de progreso y análisis de dolor
- 🔔 **Sistema de Alertas**: Notificaciones para pacientes inactivos o con aumento de dolor

### Para Pacientes
- 🎯 **Series Personalizadas**: Terapias adaptadas a cada condición específica
- ⏱️ **Temporizador Inteligente**: Guía paso a paso con control de tiempo por postura
- 📹 **Videos Instructivos**: Enlaces a videos de YouTube para cada postura
- 📊 **Seguimiento de Progreso**: Visualización de mejoras y reducción de dolor
- 💬 **Registro de Sesiones**: Comentarios y evaluación de dolor antes/después

### Características Técnicas
- 📱 **100% Responsive**: Diseño adaptable a todos los dispositivos
- 🔥 **Firebase Integration**: Auth, Firestore y Storage completamente integrados
- 🌐 **PWA**: Instalable como aplicación con funcionamiento offline
- 🎨 **UI/UX Moderno**: Interfaz intuitiva con animaciones suaves
- 🔔 **Notificaciones Visuales**: Sistema de notificaciones atractivo y sonoro

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase (Auth, Firestore, Storage, Hosting)
- **PWA**: Service Workers, Web App Manifest
- **Herramientas**: Node.js (para desarrollo local)

## 📌 Requisitos Previos

1. **Cuenta de Firebase**: [Crear cuenta gratuita](https://firebase.google.com/)
2. **Node.js**: v14+ (opcional, para desarrollo local)
3. **Navegador moderno**: Chrome, Firefox, Safari o Edge actualizado

## 🚀 Instalación

### Opción 1: Instalación Rápida con Scripts

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/softzen.git
   cd softzen
   ```

2. **Ejecutar instalación automática**
   ```bash
   # Windows
   1-INSTALAR.bat
   
   # Linux/Mac
   chmod +x install.sh && ./install.sh
   ```

3. **Configurar Firebase**
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar Authentication (Email/Password)
   - Habilitar Firestore Database
   - Habilitar Storage (opcional)
   - Copiar configuración a `frontend/js/firebase-config.js`

4. **Cargar datos demo**
   - Abrir navegador en `http://localhost:3000/setup-demo.html`
   - Seguir el asistente de configuración

### Opción 2: Instalación Manual

1. **Clonar y navegar al proyecto**
   ```bash
   git clone https://github.com/tu-usuario/softzen.git
   cd softzen
   ```

2. **Instalar Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Configurar Firebase**
   ```bash
   firebase login
   firebase init
   # Seleccionar: Firestore, Hosting, Storage
   # Directorio público: frontend
   # SPA: Yes
   ```

4. **Actualizar configuración**
   - Editar `frontend/js/firebase-config.js` con tus credenciales

5. **Desplegar reglas de seguridad**
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

## ⚙️ Configuración

### Firebase Configuration

```javascript
// frontend/js/firebase-config.js
const firebaseConfig = {
  apiKey: \"tu-api-key\",
  authDomain: \"tu-proyecto.firebaseapp.com\",
  projectId: \"tu-proyecto\",
  storageBucket: \"tu-proyecto.appspot.com\",
  messagingSenderId: \"123456789\",
  appId: \"tu-app-id\"
};
```

### Credenciales Demo

Después de ejecutar el setup, puedes acceder con:

**Instructor:**
- Email: `admin@softzen.com`
- Password: `SoftZen2024`

**Paciente:**
- Email: `paciente@softzen.com`
- Password: `SoftZen2024`

## 💻 Uso

### Desarrollo Local

```bash
# Windows
2-EJECUTAR-LOCAL.bat

# Manual
cd frontend
python -m http.server 3000
# o
npx http-server -p 3000
```

Abrir navegador en `http://localhost:3000`

### Despliegue a Producción

```bash
# Windows
3-DESPLEGAR-FIREBASE.bat

# Manual
firebase deploy
```

Tu app estará disponible en: `https://tu-proyecto.web.app`

## 📁 Estructura del Proyecto

```
Proyecto_Yoga/
├── frontend/                # Aplicación web
│   ├── index.html          # Página principal
│   ├── setup-demo.html     # Configuración inicial
│   ├── styles.css          # Estilos globales
│   ├── app.js              # Lógica principal
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service Worker
│   ├── js/                 # Módulos JavaScript
│   │   ├── firebase-config.js
│   │   ├── firebase-service.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── therapyData.js
│   │   ├── notifications.js
│   │   └── setup-demo.js
│   └── img/                # Imágenes y iconos
├── backend/                # Backend (opcional)
├── firebase.json           # Configuración Firebase
├── firestore.rules         # Reglas de seguridad
├── firestore.indexes.json  # Índices de base de datos
└── storage.rules           # Reglas de Storage
```

## 🔌 API

### Servicios de Firebase

#### Autenticación
```javascript
// Registro
await firebaseService.authService.register(email, password, userData);

// Login
await firebaseService.authService.login(email, password);

// Logout
await firebaseService.authService.logout();
```

#### Base de Datos
```javascript
// Usuarios
await firebaseService.dbService.users.get(userId);
await firebaseService.dbService.users.update(userId, data);
await firebaseService.dbService.users.getAll();

// Terapias
await firebaseService.dbService.therapies.create(therapyData);
await firebaseService.dbService.therapies.getAll();
await firebaseService.dbService.therapies.update(therapyId, data);

// Sesiones
await firebaseService.dbService.sessions.create(sessionData);
await firebaseService.dbService.sessions.getByUser(userId);
```

### Sistema de Notificaciones

```javascript
// Notificación simple
showSuccess('Operación exitosa');
showError('Error en la operación');

// Notificación compleja
notificationSystem.show({
    type: 'achievement',
    title: 'Logro Desbloqueado',
    message: 'Has completado 10 sesiones',
    duration: 6000,
    actions: [{
        text: 'Ver Progreso',
        onClick: 'viewProgress()'
    }]
});
```

## 🚧 Desarrollo

### Agregar Nueva Funcionalidad

1. Crear módulo en `frontend/js/`
2. Importar en `index.html`
3. Documentar en este README

### Testing

```bash
# Ejecutar tests (próximamente)
npm test
```

### Debugging

- Abrir DevTools (F12)
- Revisar consola para logs detallados
- Verificar Network para peticiones Firebase

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Tu Nombre]
- **Diseño UX/UI**: [Diseñador]
- **Consultor Yoga**: [Instructor]

## 📞 Soporte

- 📧 Email: soporte@softzen.com
- 📱 WhatsApp: +XX XXXX XXXX
- 🌐 Web: https://softzen.com

## 🙏 Agradecimientos

- Comunidad de yoga terapéutico
- Firebase por la infraestructura
- Todos los beta testers

---

Hecho con ❤️ y 🧘‍♀️ por el equipo de SoftZen