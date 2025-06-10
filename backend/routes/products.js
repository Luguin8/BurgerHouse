// ========================================
// RUTA DE PRODUCTOS - BURGER HOUSE
// ========================================
// Gestiona el CRUD de productos, subida de imágenes y validaciones.

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Conexión a la base de datos SQLite
const db = new sqlite3.Database(path.join(__dirname, '..', 'data', 'database.sqlite'));

// ===================== CONFIGURACIÓN DE MULTER =====================
// Para subir imágenes de productos al servidor
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ===================== OBTENER TODOS LOS PRODUCTOS =====================
// Permite paginación y búsqueda por nombre
router.get('/', (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = 'SELECT * FROM products WHERE name LIKE ?';
    let params = [`%${search}%`];
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    db.all(query, params, (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener productos' });
        }
        // Obtener el total para paginación
        db.get('SELECT COUNT(*) as total FROM products WHERE name LIKE ?', [`%${search}%`], (err2, countResult) => {
            if (err2) {
                return res.status(500).json({ error: 'Error al contar productos' });
            }
            res.json({
                products,
                total: countResult.total,
                page: parseInt(page),
                limit: parseInt(limit)
            });
        });
    });
});

// ===================== OBTENER UN PRODUCTO POR ID =====================
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el producto' });
        }
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    });
});

// ===================== VALIDACIÓN DE PRODUCTOS =====================
// Middleware para validar datos de producto en POST y PUT
const validateProduct = (req, res, next) => {
    const { name, price } = req.body;
    if (!name || typeof name !== 'string' || name.length < 2) {
        return res.status(400).json({ error: 'El nombre es obligatorio y debe tener al menos 2 caracteres' });
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
        return res.status(400).json({ error: 'El precio es obligatorio y debe ser un número mayor a 0' });
    }
    next();
};

// ===================== CREAR NUEVO PRODUCTO =====================
// Solo admin autenticado, permite subir imagen
router.post('/', authenticateToken, isAdmin, upload.single('image'), validateProduct, (req, res) => {
    const { name, description, price, category, active } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !price) {
        return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }

    db.run(
        'INSERT INTO products (name, description, price, category, image_url, active) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, price, category, image_url, active !== undefined ? active : 1],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear el producto' });
            }
            res.status(201).json({
                id: this.lastID,
                name,
                description,
                price,
                category,
                image_url,
                active: active !== undefined ? active : 1
            });
        }
    );
});

// ===================== ACTUALIZAR PRODUCTO =====================
// Solo admin autenticado, permite subir nueva imagen
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), validateProduct, (req, res) => {
    const { name, description, price, category, active } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    let updateFields = [];
    let params = [];

    if (name) {
        updateFields.push('name = ?');
        params.push(name);
    }
    if (description) {
        updateFields.push('description = ?');
        params.push(description);
    }
    if (price) {
        updateFields.push('price = ?');
        params.push(price);
    }
    if (category) {
        updateFields.push('category = ?');
        params.push(category);
    }
    if (image_url) {
        updateFields.push('image_url = ?');
        params.push(image_url);
    }
    if (active !== undefined) {
        updateFields.push('active = ?');
        params.push(active);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    params.push(req.params.id);

    db.run(
        `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
        params,
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar el producto' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            res.json({ message: 'Producto actualizado correctamente' });
        }
    );
});

// ===================== ACTUALIZAR SOLO EL ESTADO ACTIVE =====================
router.patch('/:id/active', authenticateToken, isAdmin, (req, res) => {
    const { active } = req.body;
    if (active === undefined) {
        return res.status(400).json({ error: 'Se requiere el campo active' });
    }
    db.run(
        'UPDATE products SET active = ? WHERE id = ?',
        [active, req.params.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar el estado del producto' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            res.json({ message: 'Estado del producto actualizado correctamente' });
        }
    );
});

// ===================== ELIMINAR PRODUCTO =====================
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar el producto' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado correctamente' });
    });
});

module.exports = router; 