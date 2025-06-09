const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');

const db = new sqlite3.Database(path.join(__dirname, '..', 'data', 'database.sqlite'));

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Obtener todos los productos
router.get('/', (req, res) => {
    db.all('SELECT * FROM products', [], (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener productos' });
        }
        res.json(products);
    });
});

// Obtener un producto por ID
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

// Crear un nuevo producto (requiere autenticación y rol de admin)
router.post('/', upload.single('image'), (req, res) => {
    const { name, description, price, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !price) {
        return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }

    db.run(
        'INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, category, image_url],
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
                image_url
            });
        }
    );
});

// Actualizar un producto (requiere autenticación y rol de admin)
router.put('/:id', upload.single('image'), (req, res) => {
    const { name, description, price, category } = req.body;
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

// Eliminar un producto (requiere autenticación y rol de admin)
router.delete('/:id', (req, res) => {
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