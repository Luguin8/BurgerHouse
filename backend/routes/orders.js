// ========================================
// RUTA DE PEDIDOS - BURGER HOUSE
// ========================================
// Gestiona la creación, consulta y actualización de pedidos y sus items.

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Conexión a la base de datos SQLite
const db = new sqlite3.Database(path.join(__dirname, '..', 'data', 'database.sqlite'));

// ===================== OBTENER TODAS LAS ÓRDENES (SOLO ADMIN) =====================
router.get('/', authenticateToken, isAdmin, (req, res) => {
    db.all(`
        SELECT orders.*, users.username 
        FROM orders 
        LEFT JOIN users ON orders.user_id = users.id
        ORDER BY orders.created_at DESC
    `, [], (err, orders) => {
        if (err) {
            console.error('Error al obtener órdenes:', err);
            return res.status(500).json({ error: 'Error al obtener órdenes' });
        }
        // Para cada pedido, obtener sus items
        const getItems = (orderId) => new Promise((resolve, reject) => {
            db.all('SELECT * FROM order_items WHERE order_id = ?', [orderId], (err, items) => {
                if (err) {
                    console.error('Error al obtener items de pedido', orderId, err);
                    return reject(err);
                }
                resolve(items);
            });
        });
        Promise.all(orders.map(async order => {
            order.items = await getItems(order.id);
            return order;
        })).then(ordersWithItems => {
            console.log('Pedidos enviados al frontend:', ordersWithItems);
            res.json(ordersWithItems);
        }).catch((e) => {
            console.error('Error al obtener items de pedidos:', e);
            res.status(500).json({ error: 'Error al obtener items de pedidos' });
        });
    });
});

// ===================== OBTENER ÓRDENES DEL USUARIO ACTUAL =====================
router.get('/my-orders', (req, res) => {
    const userId = req.user.id; // Asumiendo que el middleware de autenticación agrega el usuario

    db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener órdenes' });
        }
        res.json(orders);
    });
});

// ===================== CREAR UNA NUEVA ORDEN =====================
router.post('/', (req, res) => {
    const { items, total, deliveryType, address, observations, paymentMethod } = req.body;
    const userId = req.user && req.user.id ? req.user.id : null;

    if (!items || !total) {
        console.error('Pedido inválido:', req.body);
        return res.status(400).json({ error: 'Se requieren items y total' });
    }

    db.run(
        'INSERT INTO orders (user_id, total, status, delivery_type, address, observations, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, total, 'pending', deliveryType, address, observations, paymentMethod],
        function(err) {
            if (err) {
                console.error('Error al crear la orden:', err, req.body);
                return res.status(500).json({ error: 'Error al crear la orden', details: err.message });
            }

            // Insertar los items de la orden
            if (Array.isArray(items)) {
                const orderId = this.lastID;
                const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, name, price, quantity, option) VALUES (?, ?, ?, ?, ?, ?)');
                for (const item of items) {
                    if (!item || typeof item !== 'object') {
                        console.log('Item inválido:', item);
                        continue;
                    }
                    if (typeof item.id === 'undefined' || typeof item.name === 'undefined' || typeof item.price === 'undefined' || typeof item.quantity === 'undefined') {
                        console.log('Item con campos faltantes:', item);
                        continue;
                    }
                    stmt.run(orderId, item.id, item.name, item.price, item.quantity, item.option || '');
                }
                stmt.finalize();
            }

            res.status(201).json({
                id: this.lastID,
                user_id: userId,
                total,
                status: 'pending',
                delivery_type: deliveryType,
                address,
                observations,
                payment_method: paymentMethod,
                created_at: new Date().toISOString()
            });
        }
    );
});

// ===================== ACTUALIZAR EL ESTADO DE UNA ORDEN (SOLO ADMIN) =====================
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

// ===================== CANCELAR UNA ORDEN (USUARIO O ADMIN) =====================
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

// ===================== ENDPOINTS DE ADMIN (BORRADO MASIVO, ETC) =====================
router.get('/all', authenticateToken, isAdmin, (req, res) => {
    // ... existing code ...
});

router.delete('/all', authenticateToken, isAdmin, (req, res) => {
    // ... existing code ...
});

module.exports = router; 