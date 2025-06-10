// ========================================
// RUTA DE AUTENTICACIÓN - BURGER HOUSE
// ========================================
// Gestiona el registro y login de usuarios, usando JWT y bcrypt.

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conexión a la base de datos SQLite
const db = new sqlite3.Database(path.join(__dirname, '..', 'data', 'database.sqlite'));

// ===================== REGISTRO DE USUARIO =====================
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Se requieren nombre de usuario y contraseña' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Encripta la contraseña
        const userRole = role === 'admin' ? 'admin' : 'user';
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
            [username, hashedPassword, userRole], 
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'El nombre de usuario ya existe' });
                    }
                    return res.status(500).json({ error: 'Error al registrar usuario' });
                }

                // Genera un token JWT para el nuevo usuario
                const token = jwt.sign({ id: this.lastID, username, role: userRole }, process.env.JWT_SECRET, {
                    expiresIn: '24h'
                });

                res.json({ token });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

// ===================== LOGIN DE USUARIO =====================
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Se requieren nombre de usuario y contraseña' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error al buscar usuario' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        try {
            const match = await bcrypt.compare(password, user.password); // Compara la contraseña

            if (!match) {
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }

            // Genera un token JWT para el usuario autenticado
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ token });
        } catch (error) {
            res.status(500).json({ error: 'Error al procesar la solicitud' });
        }
    });
});

module.exports = router; 