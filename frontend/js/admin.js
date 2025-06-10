// admin.js
// Este archivo contiene la lógica del panel de administración: login, gestión de productos, pedidos y configuración de WhatsApp.

// ===================== VARIABLES GLOBALES =====================

let jwtToken = localStorage.getItem('jwtToken') || '';
let isAuthenticated = false;

// ===================== ELEMENTOS DEL DOM =====================

const loginOverlay = document.getElementById('login-overlay'); // Capa de login
const adminPanel = document.getElementById('admin-panel'); // Panel principal
const loginForm = document.getElementById('login-form'); // Formulario de login
const logoutBtn = document.getElementById('logout-btn'); // Botón de logout
const addProductForm = document.getElementById('add-product-form'); // Formulario para agregar producto
const editModal = document.getElementById('edit-modal'); // Modal de edición
const editProductForm = document.getElementById('edit-product-form'); // Formulario de edición
const productsGrid = document.getElementById('products-grid'); // Grilla de productos
const notification = document.getElementById('notification'); // Notificación flotante
const ordersList = document.getElementById('orders-list'); // Contenedor de pedidos
const wppForm = document.getElementById('wpp-form'); // Formulario de WhatsApp
const wppMsg = document.getElementById('wpp-msg'); // Mensaje de WhatsApp
const btnAddProduct = document.getElementById('btn-add-product'); // Botón para agregar producto
const btnExportOrders = document.getElementById('btn-export-orders'); // Botón exportar pedidos
const btnDeleteOrders = document.getElementById('btn-delete-orders'); // Botón eliminar todos los pedidos

// ===================== UTILIDADES =====================

/**
 * Muestra una notificación flotante en pantalla.
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} isError - Si es true, muestra como error
 */
function showNotification(message, isError = false) {
    if (!notification) return;
    notification.textContent = message;
    notification.className = 'notification' + (isError ? ' error' : ' success');
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

/**
 * Guarda el token JWT y actualiza el estado de autenticación.
 * @param {string} token
 */
function setAuth(token) {
    jwtToken = token;
    localStorage.setItem('jwtToken', token);
    isAuthenticated = true;
}

/**
 * Limpia el token y el estado de autenticación.
 */
function clearAuth() {
    jwtToken = '';
    localStorage.removeItem('jwtToken');
    isAuthenticated = false;
}

/**
 * Devuelve los headers de autenticación para las peticiones protegidas.
 */
function getAuthHeaders() {
    return jwtToken ? { 'Authorization': 'Bearer ' + jwtToken } : {};
}

// ===================== UI =====================

/**
 * Actualiza la interfaz según el estado de autenticación.
 */
function updateAuthUI() {
    if (isAuthenticated) {
        loginOverlay.style.display = 'none';
        adminPanel.style.display = 'block';
        loadProducts();
        loadOrders();
    } else {
        loginOverlay.style.display = 'flex';
        adminPanel.style.display = 'none';
    }
}

// ===================== API =====================

/**
 * Realiza el login del usuario administrador.
 */
async function login(username, password) {
    try {
        const res = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Credenciales incorrectas');
        const data = await res.json();
        setAuth(data.token);
        updateAuthUI();
        showNotification('Inicio de sesión exitoso');
    } catch (e) {
        showNotification('Usuario o contraseña incorrectos', true);
    }
}

/**
 * Carga los productos desde la API y los muestra en la grilla de administración.
 */
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/products', {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        const products = data.products || data;
        productsGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <span class="product-status ${product.active !== false ? 'status-active' : 'status-inactive'}">
                    ${product.active !== false ? 'Activo' : 'Inactivo'}
                </span>
                <img src="${product.image_url ? (product.image_url.startsWith('/uploads/') ? product.image_url : '/uploads/' + product.image_url.replace(/^.*[\\\/]/, '')) : product.image}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>Tipo: ${product.category || product.type}</p>
                <p>Precio: $${product.price}</p>
                <div class="product-actions">
                    <button class="edit-btn" onclick="showEditModal(${product.id})">Editar</button>
                    <button class="toggle-btn" onclick="toggleProductStatus(${product.id}, ${product.active !== false})">
                        ${product.active !== false ? 'Desactivar' : 'Activar'}
                    </button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Eliminar</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        productsGrid.innerHTML = '<p>Error al cargar productos.</p>';
    }
}

/**
 * Carga los pedidos desde la API y los muestra en la tabla de administración.
 */
async function loadOrders() {
    try {
        const res = await fetch('http://localhost:3000/orders', {
            headers: getAuthHeaders()
        });
        const orders = await res.json();
        const tbody = document.getElementById('orders-tbody');
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.created_at ? order.created_at.split('T')[0] : ''}</td>
                <td>$${order.total}</td>
                <td>${order.delivery_type || ''}</td>
                <td>${order.address || ''}</td>
                <td>${order.observations || ''}</td>
                <td>${order.payment_method || ''}</td>
                <td><button onclick="alert('Detalle no implementado')">Ver</button></td>
            </tr>
        `).join('');
    } catch (e) {
        document.getElementById('orders-tbody').innerHTML = '<tr><td colspan="8">Error al cargar pedidos</td></tr>';
    }
}

// ===================== EVENTOS =====================

// Login de administrador
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    login(username, password);
});

// Logout
logoutBtn.addEventListener('click', () => {
    clearAuth();
    updateAuthUI();
    showNotification('Sesión cerrada');
});

/**
 * Muestra el número de WhatsApp y el mensaje predeterminado guardados en localStorage.
 */
function mostrarNumeroWppActual() {
    const actual = localStorage.getItem('wppNumber');
    document.getElementById('wpp-actual-num').textContent = actual ? actual : 'No configurado';
    const template = localStorage.getItem('wppTemplate') || '';
    document.getElementById('wpp-template').value = template;
}

// Al cargar la página, actualiza la UI y muestra datos de WhatsApp
window.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    mostrarNumeroWppActual();
    // Navegación entre secciones del panel admin
    const navLinks = document.querySelectorAll('.admin-navbar-links a');
    const sections = [
        document.getElementById('admin-products'),
        document.getElementById('admin-add-product'),
        document.getElementById('admin-orders'),
        document.getElementById('admin-wpp')
    ];
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            sections.forEach(sec => sec.style.display = 'none');
            if (sectionId) {
                const section = document.getElementById(sectionId);
                if (section) section.style.display = 'block';
            }
        });
    });
});

// Guardar número de WhatsApp (requiere autenticación)
wppForm.onsubmit = async function(e) {
    e.preventDefault();
    const username = prompt('Confirma tu usuario de administrador:');
    const password = prompt('Confirma tu contraseña:');
    if (!username || !password) {
        wppMsg.textContent = 'Debes ingresar usuario y contraseña para confirmar.';
        return;
    }
    try {
        const res = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Credenciales incorrectas');
        localStorage.setItem('wppNumber', document.getElementById('wpp-number').value);
        mostrarNumeroWppActual();
        wppMsg.textContent = 'Número guardado correctamente';
    } catch (err) {
        wppMsg.textContent = 'Usuario o contraseña incorrectos';
    }
};

// Guardar mensaje predeterminado de WhatsApp
document.getElementById('btn-save-template').onclick = function() {
    localStorage.setItem('wppTemplate', document.getElementById('wpp-template').value);
    mostrarNumeroWppActual();
    showNotification('Mensaje predeterminado guardado correctamente');
};

// Mostrar formulario para agregar producto
btnAddProduct.addEventListener('click', function() {
    document.getElementById('admin-products').style.display = 'none';
    document.getElementById('admin-add-product').style.display = 'block';
});

// Volver a la lista después de agregar producto
addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // ... lógica para agregar producto ...
    document.getElementById('admin-add-product').style.display = 'none';
    document.getElementById('admin-products').style.display = 'block';
});

// Delegación de eventos para los botones de las cards de productos
productsGrid.addEventListener('click', async function(e) {
    if (e.target.classList.contains('edit-btn')) {
        const id = e.target.closest('.product-card').dataset.id;
        showEditModal(id);
    } else if (e.target.classList.contains('toggle-btn')) {
        const id = e.target.closest('.product-card').dataset.id;
        const isActive = e.target.textContent.trim() === 'Desactivar';
        toggleProductStatus(id, isActive);
    } else if (e.target.classList.contains('delete-btn')) {
        const id = e.target.closest('.product-card').dataset.id;
        deleteProduct(id);
    }
}); 