// ========================================
// SCRIPT PARA ASIGNAR ROL ADMIN
// ========================================
// Este script actualiza el usuario 'admin' en la base de datos para que tenga rol de administrador.

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos SQLite
const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

// Actualiza el rol del usuario 'admin' a 'admin'
db.run("UPDATE users SET role='admin' WHERE username='admin'", function(err) {
    if (err) {
        console.error('Error actualizando el rol:', err.message);
    } else {
        console.log('Rol actualizado correctamente para el usuario admin.');
    }
    db.close();
}); 