// Backend Server - SoftZen v2.1
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Crear carpetas necesarias
const uploadsDir = path.join(__dirname, 'uploads');
const logsDir = path.join(__dirname, 'logs');
const dbDir = path.join(__dirname, 'db');

[uploadsDir, logsDir, dbDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Base de datos SQLite
const dbPath = path.join(dbDir, 'therapy.db');
const db = new sqlite3.Database(dbPath);

// Inicializar base de datos
db.serialize(() => {
    // Tabla de terapias
    db.run(`CREATE TABLE IF NOT EXISTS therapies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        duration INTEGER,
        level TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de usuarios locales (backup)
    db.run(`CREATE TABLE IF NOT EXISTS users_backup (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firebase_uid TEXT UNIQUE,
        email TEXT,
        name TEXT,
        user_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de sesiones de terapia
    db.run(`CREATE TABLE IF NOT EXISTS therapy_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        therapy_id INTEGER,
        duration INTEGER,
        completed BOOLEAN DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (therapy_id) REFERENCES therapies (id)
    )`);

    // Insertar terapias predefinidas si no existen
    db.get("SELECT COUNT(*) as count FROM therapies", (err, row) => {
        if (row.count === 0) {
            const predefinedTherapies = [
                {
                    name: 'Yoga Suave para Principiantes',
                    description: 'Introducción suave al yoga terapéutico con posturas básicas',
                    duration: 30,
                    level: 'Principiante',
                    category: 'Relajación'
                },
                {
                    name: 'Respiración Consciente',
                    description: 'Técnicas de respiración para reducir el estrés y la ansiedad',
                    duration: 20,
                    level: 'Todos',
                    category: 'Respiración'
                },
                {
                    name: 'Yoga para Dolor de Espalda',
                    description: 'Secuencia especializada para aliviar dolores de espalda',
                    duration: 45,
                    level: 'Intermedio',
                    category: 'Terapéutico'
                },
                {
                    name: 'Meditación Guiada',
                    description: 'Sesión de meditación para calmar la mente',
                    duration: 25,
                    level: 'Todos',
                    category: 'Meditación'
                },
                {
                    name: 'Yoga Restaurativo',
                    description: 'Posturas pasivas para una relajación profunda',
                    duration: 60,
                    level: 'Todos',
                    category: 'Restaurativo'
                }
            ];

            const stmt = db.prepare("INSERT INTO therapies (name, description, duration, level, category) VALUES (?, ?, ?, ?, ?)");
            predefinedTherapies.forEach(therapy => {
                stmt.run(therapy.name, therapy.description, therapy.duration, therapy.level, therapy.category);
            });
            stmt.finalize();
            console.log('[DB] Terapias predefinidas insertadas');
        }
    });
});

// Rutas API

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '2.1'
    });
});

// Obtener todas las terapias
app.get('/api/therapies', (req, res) => {
    db.all("SELECT * FROM therapies ORDER BY created_at DESC", (err, rows) => {
        if (err) {
            console.error('[API] Error obteniendo terapias:', err);
            res.status(500).json({ error: 'Error al obtener terapias' });
            return;
        }
        res.json(rows);
    });
});

// Obtener terapia por ID
app.get('/api/therapies/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM therapies WHERE id = ?", [id], (err, row) => {
        if (err) {
            console.error('[API] Error obteniendo terapia:', err);
            res.status(500).json({ error: 'Error al obtener terapia' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Terapia no encontrada' });
            return;
        }
        res.json(row);
    });
});

// Crear nueva terapia
app.post('/api/therapies', (req, res) => {
    const { name, description, duration, level, category } = req.body;
    
    if (!name) {
        res.status(400).json({ error: 'El nombre es requerido' });
        return;
    }

    db.run(
        "INSERT INTO therapies (name, description, duration, level, category) VALUES (?, ?, ?, ?, ?)",
        [name, description, duration, level, category],
        function(err) {
            if (err) {
                console.error('[API] Error creando terapia:', err);
                res.status(500).json({ error: 'Error al crear terapia' });
                return;
            }
            res.json({ 
                id: this.lastID,
                message: 'Terapia creada exitosamente'
            });
        }
    );
});

// Actualizar terapia
app.put('/api/therapies/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, duration, level, category } = req.body;
    
    db.run(
        "UPDATE therapies SET name = ?, description = ?, duration = ?, level = ?, category = ? WHERE id = ?",
        [name, description, duration, level, category, id],
        function(err) {
            if (err) {
                console.error('[API] Error actualizando terapia:', err);
                res.status(500).json({ error: 'Error al actualizar terapia' });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Terapia no encontrada' });
                return;
            }
            res.json({ message: 'Terapia actualizada exitosamente' });
        }
    );
});

// Eliminar terapia
app.delete('/api/therapies/:id', (req, res) => {
    const { id } = req.params;
    
    db.run("DELETE FROM therapies WHERE id = ?", [id], function(err) {
        if (err) {
            console.error('[API] Error eliminando terapia:', err);
            res.status(500).json({ error: 'Error al eliminar terapia' });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Terapia no encontrada' });
            return;
        }
        res.json({ message: 'Terapia eliminada exitosamente' });
    });
});

// Registrar sesión de terapia
app.post('/api/sessions', (req, res) => {
    const { user_id, therapy_id, duration, completed, notes } = req.body;
    
    db.run(
        "INSERT INTO therapy_sessions (user_id, therapy_id, duration, completed, notes) VALUES (?, ?, ?, ?, ?)",
        [user_id, therapy_id, duration, completed ? 1 : 0, notes],
        function(err) {
            if (err) {
                console.error('[API] Error registrando sesión:', err);
                res.status(500).json({ error: 'Error al registrar sesión' });
                return;
            }
            res.json({ 
                id: this.lastID,
                message: 'Sesión registrada exitosamente'
            });
        }
    );
});

// Obtener sesiones de un usuario
app.get('/api/sessions/:userId', (req, res) => {
    const { userId } = req.params;
    
    db.all(
        `SELECT s.*, t.name as therapy_name, t.category 
         FROM therapy_sessions s 
         JOIN therapies t ON s.therapy_id = t.id 
         WHERE s.user_id = ? 
         ORDER BY s.created_at DESC`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error('[API] Error obteniendo sesiones:', err);
                res.status(500).json({ error: 'Error al obtener sesiones' });
                return;
            }
            res.json(rows);
        }
    );
});

// Ruta catch-all para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('[Server] Error:', err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    SOFTZEN BACKEND v2.1                      ║
║                  Servidor iniciado con éxito                 ║
╚══════════════════════════════════════════════════════════════╝

🚀 Servidor corriendo en: http://localhost:${PORT}
📁 Base de datos: ${dbPath}
🔧 Modo: ${process.env.NODE_ENV || 'development'}
📅 Iniciado: ${new Date().toLocaleString()}

[INFO] Endpoints disponibles:
  - GET    /api/health
  - GET    /api/therapies
  - GET    /api/therapies/:id
  - POST   /api/therapies
  - PUT    /api/therapies/:id
  - DELETE /api/therapies/:id
  - POST   /api/sessions
  - GET    /api/sessions/:userId

✅ Servidor listo para recibir peticiones
`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM recibido, cerrando servidor...');
    db.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[Server] SIGINT recibido, cerrando servidor...');
    db.close();
    process.exit(0);
});