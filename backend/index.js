// ========================================
// BACKEND PRINCIPAL - BURGER HOUSE
// ========================================
// Este archivo configura y levanta el servidor Express, inicializa la base de datos,
// importa rutas y aplica middlewares globales.

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken, isAdmin } = require('./middlewares/authMiddleware');

// ===================== CONFIGURACIÓN DE VARIABLES DE ENTORNO =====================
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

// ===================== SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND =====================
app.use(express.static(path.join(__dirname, '../frontend')));

// ===================== MIDDLEWARES GLOBALES =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===================== CONFIGURACIÓN DE LA BASE DE DATOS =====================
const db = new sqlite3.Database(path.join(__dirname, 'data', 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos SQLite');
        // Crear tablas si no existen
        initializeDatabase();
    }
});

// Crea las tablas necesarias si no existen
function initializeDatabase() {
    db.serialize(() => {
        // Tabla de usuarios
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )`);

        // Tabla de productos
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT,
            image_url TEXT,
            active INTEGER DEFAULT 1
        )`);

        // Tabla de órdenes
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            status TEXT DEFAULT 'pending',
            total REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        // Tabla de items de pedido
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            name TEXT,
            price REAL,
            quantity INTEGER,
            option TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )`);
    });
}

// ===================== IMPORTAR RUTAS =====================
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// ===================== RUTA BÁSICA DE PRUEBA =====================
app.get('/', (req, res) => {
    res.json({ message: 'API de Comida funcionando correctamente' });
});

// ===================== USAR RUTAS =====================
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes); // público para POST

// ===================== MANEJO DE ERRORES =====================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

if (!process.env.JWT_SECRET) {
    console.error('Falta la variable de entorno JWT_SECRET. El servidor no puede iniciar.');
    process.exit(1);
}

// ===================== INICIAR EL SERVIDOR =====================
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 