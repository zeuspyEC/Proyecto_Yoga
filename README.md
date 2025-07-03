# 🧘‍♀️ SoftZen - Aplicación de Yoga Terapéutico

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)

## 📋 Descripción

SoftZen es una aplicación web progresiva (PWA) para yoga terapéutico que permite a instructores y pacientes gestionar sesiones de yoga personalizadas. La aplicación cuenta con autenticación segura, gestión de terapias, seguimiento de progreso y reportes detallados.

## ✨ Características

### Para Instructores
- 👥 Gestión completa de pacientes
- 📝 Creación y edición de terapias personalizadas
- 📊 Reportes detallados de progreso
- 🎯 Seguimiento de sesiones

### Para Pacientes
- 🧘‍♀️ Acceso a terapias asignadas
- 📈 Visualización de progreso personal
- 📱 Interfaz intuitiva y responsiva
- 🔔 Notificaciones de sesiones

### Técnicas
- 🔐 Autenticación segura con Firebase Auth
- 💾 Base de datos en tiempo real con Firestore
- 📱 Progressive Web App (PWA)
- 🚀 Optimizado para rendimiento
- 🌐 Funciona offline

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 14+ instalado
- Cuenta de Firebase (gratuita)
- Git (opcional)

### Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   git clone https://github.com/tu-usuario/Proyecto-SoftZen.git
   cd Proyecto-SoftZen
   ```

2. **Instalar dependencias**
   ```bash
   1-INSTALAR.bat
   ```
   O manualmente:
   ```bash
   cd backend
   npm install
   ```

3. **Configurar usuarios demo**
   - Abrir `http://localhost:3001/setup-demo.html`
   - Seguir los pasos en pantalla

4. **Ejecutar localmente**
   ```bash
   2-EJECUTAR-LOCAL.bat
   ```
   - La aplicación estará disponible en: `http://localhost:3001`

### Credenciales Demo

| Tipo | Email | Contraseña |
|------|-------|------------|
| **Instructor** | admin@softzen.com | SoftZen2024 |
| **Paciente** | paciente@softzen.com | SoftZen2024 |

## 📁 Estructura del Proyecto

```
Proyecto-SoftZen/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── db/
│   │   └── therapy.db     # Base de datos SQLite
│   └── package.json
│
├── frontend/
│   ├── index.html         # Página principal
│   ├── setup-demo.html    # Configuración inicial
│   ├── test.html          # Página de pruebas
│   ├── styles.css         # Estilos globales
│   ├── app.js            # Lógica principal
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service Worker
│   └── js/
│       ├── firebase-config.js    # Configuración Firebase
│       ├── firebase-service.js   # Servicios Firebase
│       ├── auth.js              # Módulo de autenticación
│       └── dashboard.js         # Módulo del dashboard
│
├── firebase.json         # Configuración Firebase Hosting
├── firestore.rules      # Reglas de seguridad Firestore
├── storage.rules        # Reglas de seguridad Storage
└── *.bat               # Scripts de Windows

```

## 🚀 Despliegue en Producción

### Opción 1: Firebase Hosting (Recomendado)

1. **Instalar Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Iniciar sesión en Firebase**
   ```bash
   firebase login
   ```

3. **Desplegar**
   ```bash
   3-DESPLEGAR-FIREBASE.bat
   ```
   O manualmente:
   ```bash
   firebase deploy
   ```

Tu aplicación estará disponible en:
- `https://pagina-yoga.web.app`
- `https://pagina-yoga.firebaseapp.com`

### Opción 2: Hosting Tradicional

1. Subir el contenido de `/frontend` a tu servidor
2. Configurar HTTPS (requerido para PWA)
3. Actualizar las URLs en `firebase-config.js`

## 🔧 Configuración

### Variables de Entorno (Backend)

Crear archivo `.env` en `/backend`:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=tu_secret_key_segura
```

### Firebase

1. **Crear proyecto en Firebase Console**
   - Ir a [Firebase Console](https://console.firebase.google.com)
   - Crear nuevo proyecto
   - Habilitar Authentication, Firestore y Storage

2. **Actualizar configuración**
   - Copiar configuración de Firebase
   - Actualizar `frontend/js/firebase-config.js`

3. **Configurar reglas de seguridad**
   - Aplicar reglas desde `firestore.rules`
   - Aplicar reglas desde `storage.rules`

## 🧪 Testing

### Test Manual
1. Abrir `http://localhost:3001/test.html`
2. Verificar todos los servicios
3. Probar login con credenciales demo

### Verificar PWA
1. Abrir Chrome DevTools
2. Ir a Application > Service Workers
3. Verificar que esté registrado y activo

## 📱 Características PWA

- ✅ Instalable en dispositivos
- ✅ Funciona offline
- ✅ Sincronización en background
- ✅ Notificaciones push (próximamente)
- ✅ Actualización automática

## 🛠️ Solución de Problemas

### "No puedo iniciar sesión"
- Verificar credenciales exactas (sin espacios)
- Ejecutar setup-demo.html para crear usuarios
- Revisar consola del navegador

### "Firebase no funciona"
- Verificar conexión a internet
- Revisar configuración en firebase-config.js
- Verificar que Firebase esté inicializado

### "El backend no responde"
- Verificar que esté ejecutándose en puerto 3001
- Revisar logs en la terminal
- Verificar firewall/antivirus

## 🔒 Seguridad

- Autenticación con Firebase Auth
- Reglas de Firestore configuradas
- HTTPS requerido en producción
- Tokens JWT para API
- Validación de datos en cliente y servidor

## 📈 Mejoras Futuras

- [ ] Chat en tiempo real instructor-paciente
- [ ] Videollamadas integradas
- [ ] Exportación de reportes PDF
- [ ] App móvil nativa
- [ ] Integración con wearables
- [ ] Análisis con IA

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [GitHub](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Firebase por la infraestructura
- La comunidad de yoga terapéutico
- Todos los beta testers

---

**SoftZen v2.1** - Transformando vidas a través del yoga terapéutico 🧘‍♀️✨