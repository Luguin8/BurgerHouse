// Variables globales
let currentProducts = [];
let currentOrders = [];

// Funciones de administración
function loadProductsInAdmin() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    currentProducts = productsModule.getAllProducts();
    
    productList.innerHTML = currentProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="item-type">Tipo: ${product.type}</p>
            <p class="item-price">$${product.price}</p>
            <div class="status-badge ${product.active ? 'active' : 'inactive'}">
                ${product.active ? 'Activo' : 'Inactivo'}
            </div>
            <div class="product-actions">
                <button class="edit-btn" onclick="adminModule.editProduct(${product.id})">Editar</button>
                <button class="toggle-btn" onclick="adminModule.toggleProductStatus(${product.id})">
                    ${product.active ? 'Desactivar' : 'Activar'}
                </button>
                <button class="delete-btn" onclick="adminModule.deleteProduct(${product.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function editProduct(id) {
    const product = currentProducts.find(p => p.id === id);
    if (!product) return;

    const modal = document.getElementById('edit-modal');
    
    document.getElementById('edit-id').value = product.id;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-description').value = product.description;
    document.getElementById('edit-type').value = product.type;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-active').checked = product.active;
    
    if (product.image) {
        const preview = document.getElementById('edit-image-preview');
        preview.src = product.image;
        preview.style.display = 'block';
    }

    modal.style.display = 'block';
}

function saveProduct(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('edit-id').value);
    const productIndex = currentProducts.findIndex(p => p.id === id);
    
    if (productIndex === -1) return;
    
    const updatedProduct = {
        ...currentProducts[productIndex],
        name: document.getElementById('edit-name').value,
        description: document.getElementById('edit-description').value,
        type: document.getElementById('edit-type').value,
        price: parseInt(document.getElementById('edit-price').value),
        active: document.getElementById('edit-active').checked
    };
    
    const imageFile = document.getElementById('edit-image').files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            updatedProduct.image = e.target.result;
            updateProduct(productIndex, updatedProduct);
        };
        reader.readAsDataURL(imageFile);
    } else {
        updateProduct(productIndex, updatedProduct);
    }
    
    closeEditModal();
}

function updateProduct(index, product) {
    currentProducts[index] = product;
    productsModule.saveProducts(currentProducts);
    loadProductsInAdmin();
}

function toggleProductStatus(id) {
    const product = currentProducts.find(p => p.id === id);
    if (product) {
        product.active = !product.active;
        productsModule.saveProducts(currentProducts);
        loadProductsInAdmin();
    }
}

function deleteProduct(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        currentProducts = currentProducts.filter(p => p.id !== id);
        productsModule.saveProducts(currentProducts);
        loadProductsInAdmin();
    }
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === '1234') {
        document.getElementById('login-overlay').style.display = 'none';
        document.querySelector('.admin-container').style.display = 'block';
        loadProductsInAdmin();
    } else {
        alert('Contraseña incorrecta');
    }
}

// Función para cargar los pedidos
function loadOrders() {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;

    // Obtener pedidos del localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    currentOrders = orders;

    if (orders.length === 0) {
        ordersList.innerHTML = '<p>No hay pedidos registrados.</p>';
        return;
    }

    ordersList.innerHTML = orders.map((order, index) => `
        <div class="order-item">
            <h3>Pedido #${index + 1}</h3>
            <p><strong>Fecha:</strong> ${new Date(order.date).toLocaleString()}</p>
            <p><strong>Método de Pago:</strong> ${order.paymentMethod}</p>
            <p><strong>Dirección:</strong> ${order.address}</p>
            <div class="order-details">
                <h4>Productos:</h4>
                ${order.items.map(item => `
                    <p>${item.name} - $${item.price} x ${item.quantity}</p>
                `).join('')}
                <p><strong>Total:</strong> $${order.total}</p>
            </div>
            <select class="status-select" onchange="updateOrderStatus(${index}, this.value)">
                <option value="pendiente" ${order.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="preparando" ${order.status === 'preparando' ? 'selected' : ''}>Preparando</option>
                <option value="enviado" ${order.status === 'enviado' ? 'selected' : ''}>Enviado</option>
                <option value="entregado" ${order.status === 'entregado' ? 'selected' : ''}>Entregado</option>
            </select>
        </div>
    `).join('');
}

// Función para actualizar el estado de un pedido
function updateOrderStatus(orderIndex, newStatus) {
    if (orderIndex >= 0 && orderIndex < currentOrders.length) {
        currentOrders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(currentOrders));
    }
}

// Función para exportar pedidos
function exportOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    if (orders.length === 0) {
        alert('No hay pedidos para exportar');
        return;
    }

    const csvContent = [
        ['Pedido #', 'Fecha', 'Método de Pago', 'Dirección', 'Productos', 'Total', 'Estado'],
        ...orders.map((order, index) => [
            index + 1,
            new Date(order.date).toLocaleString(),
            order.paymentMethod,
            order.address,
            order.items.map(item => `${item.name} x${item.quantity}`).join('; '),
            order.total,
            order.status || 'pendiente'
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pedidos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Función para borrar todos los pedidos
function clearOrders() {
    if (confirm('¿Estás seguro de que deseas borrar todos los pedidos? Esta acción no se puede deshacer.')) {
        localStorage.setItem('orders', '[]');
        loadOrders();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    
    // Edit product form
    document.getElementById('edit-product-form')?.addEventListener('submit', saveProduct);
    
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');

            // Cargar pedidos cuando se selecciona la pestaña de pedidos
            if (tabId === 'orders') {
                loadOrders();
            }
        });
    });

    // Cargar productos iniciales
    loadProductsInAdmin();
});

// Exportar funciones
window.adminModule = {
    loadProductsInAdmin,
    editProduct,
    toggleProductStatus,
    deleteProduct,
    closeEditModal,
    loadOrders,
    updateOrderStatus,
    exportOrders,
    clearOrders
}; 