const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '..', 'data', 'database.sqlite'));

// Obtener todas las órdenes (solo admin)
router.get('/', (req, res) => {
    db.all(`
        SELECT orders.*, users.username 
        FROM orders 
        JOIN users ON orders.user_id = users.id
        ORDER BY orders.created_at DESC
    `, [], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener órdenes' });
        }
        res.json(orders);
    });
});

// Obtener órdenes del usuario actual
router.get('/my-orders', (req, res) => {
    const userId = req.user.id; // Asumiendo que el middleware de autenticación agrega el usuario

    db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener órdenes' });
        }
        res.json(orders);
    });
});

// Crear una nueva orden
router.post('/', (req, res) => {
    const { items, total } = req.body;
    const userId = req.user.id; // Asumiendo que el middleware de autenticación agrega el usuario

    if (!items || !total) {
        return res.status(400).json({ error: 'Se requieren items y total' });
    }

    db.run(
        'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
        [userId, total, 'pending'],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear la orden' });
            }

            // Aquí podrías agregar lógica adicional para guardar los items de la orden
            // en una tabla separada si lo necesitas

            res.status(201).json({
                id: this.lastID,
                user_id: userId,
                total,
                status: 'pending',
                created_at: new Date().toISOString()
            });
        }
    );
});

// Actualizar el estado de una orden (solo admin)
router.put('/:id/status', (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!status) {
        return res.status(400).json({ error: 'Se requiere el estado' });
    }

    db.run(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar la orden' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Orden no encontrada' });
            }
            res.json({ message: 'Estado de la orden actualizado correctamente' });
        }
    );
});

// Cancelar una orden (usuario o admin)
router.delete('/:id', (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let query = 'DELETE FROM orders WHERE id = ?';
    let params = [orderId];

    if (!isAdmin) {
        // Si no es admin, solo puede cancelar sus propias órdenes
        query += ' AND user_id = ?';
        params.push(userId);
    }

    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error al cancelar la orden' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Orden no encontrada o no autorizado' });
        }
        res.json({ message: 'Orden cancelada correctamente' });
    });
});

module.exports = router; 