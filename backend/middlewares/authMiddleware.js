// ========================================
// MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN
// ========================================
// Proveen protección de rutas mediante JWT y validación de rol admin.

const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar el token JWT en las rutas protegidas.
 * Si el token es válido, agrega el usuario al objeto req.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

/**
 * Middleware para verificar si el usuario autenticado es admin.
 */
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
    }
    next();
};

module.exports = { authenticateToken, isAdmin }; 