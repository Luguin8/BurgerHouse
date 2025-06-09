// Datos de las hamburguesas
const burgers = [
    {
        id: 1,
        name: "Clásica",
        description: "Medallón de carne, lechuga, tomate, cebolla y nuestra salsa especial",
        type: "Común",
        price: 1500,
        image: "https://via.placeholder.com/200x200"
    },
    {
        id: 2,
        name: "Doble Cheddar",
        description: "Doble medallón de carne, doble cheddar, bacon y salsa barbacoa",
        type: "Especial",
        price: 2200,
        image: "https://via.placeholder.com/200x200"
    },
    {
        id: 3,
        name: "BBQ Bacon",
        description: "Medallón de carne, bacon crocante, cebolla caramelizada y salsa BBQ",
        type: "Especial",
        price: 2000,
        image: "https://via.placeholder.com/200x200"
    },
    {
        id: 4,
        name: "Mexicana",
        description: "Medallón de carne, guacamole, jalapeños, nachos y salsa picante",
        type: "Especial",
        price: 1900,
        image: "https://via.placeholder.com/200x200"
    },
    {
        id: 5,
        name: "Veggie",
        description: "Medallón de lentejas y vegetales, lechuga, tomate y mayonesa vegana",
        type: "Común",
        price: 1700,
        image: "https://via.placeholder.com/200x200"
    },
    {
        id: 6,
        name: "La Gigante",
        description: "Triple medallón de carne, triple cheddar, bacon, huevo y salsa especial",
        type: "Especial",
        price: 2500,
        image: "https://via.placeholder.com/200x200"
    }
];

// Estado del carrito
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Elementos del DOM
const burgerModal = document.getElementById('burger-modal');
const cartModal = document.getElementById('cart-modal');
const cartIcon = document.querySelector('.cart-icon');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total-amount');
const checkoutForm = document.getElementById('checkout-form');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar carrito desde localStorage
    updateCartCount();
    
    // Botones de "Ver Detalles"
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', showBurgerDetails);
    });

    // Botón de "Añadir al Carrito" en promoción
    document.querySelector('.promo-card .add-to-cart-btn')?.addEventListener('click', (e) => {
        const button = e.target;
        const promo = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: parseInt(button.dataset.price),
            type: 'Promoción',
            image: button.dataset.image || 'https://via.placeholder.com/200x200'
        };
        addToCart(promo);
    });

    // Botón de "Añadir al Carrito" en modal de hamburguesa
    document.getElementById('modal-add-to-cart').addEventListener('click', addToCartFromModal);

    // Botón del carrito
    cartIcon.addEventListener('click', showCart);

    // Cerrar modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            burgerModal.style.display = 'none';
            cartModal.style.display = 'none';
        });
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === burgerModal || e.target === cartModal) {
            burgerModal.style.display = 'none';
            cartModal.style.display = 'none';
        }
    });

    // Formulario de checkout
    checkoutForm.addEventListener('submit', handleCheckout);

    // Si estamos en la página de administración
    if (document.getElementById('product-list')) {
        loadProductsInAdmin();
        
        // Event listeners para las pestañas
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                
                // Actualizar botones
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                // Actualizar contenido
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
});

// Funciones
function showBurgerDetails(e) {
    const burgerId = e.target.closest('.burger-card').dataset.id;
    const burger = burgers.find(b => b.id === parseInt(burgerId));
    
    document.getElementById('modal-title').textContent = burger.name;
    document.getElementById('modal-img').src = burger.image;
    document.getElementById('modal-description').textContent = burger.description;
    document.getElementById('modal-type').textContent = `Tipo: ${burger.type}`;
    document.getElementById('modal-price').textContent = `Precio: $${burger.price}`;
    
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart');
    modalAddToCartBtn.dataset.id = burger.id;
    
    burgerModal.style.display = 'block';
}

function addToCartFromModal() {
    const burgerId = parseInt(document.getElementById('modal-add-to-cart').dataset.id);
    const burger = burgers.find(b => b.id === burgerId);
    addToCart(burger);
    burgerModal.style.display = 'none';
}

function addToCart(item) {
    const existingItem = cart.find(i => i.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartCount();
    updateCartDisplay();
    showNotification(`${item.name} añadido al carrito`);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function showCart() {
    updateCartDisplay();
    cartModal.style.display = 'block';
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">No hay productos en el carrito</p>';
        cartTotalAmount.textContent = '$0';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="item-type">${item.type}</p>
                <p class="item-price">$${item.price}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalAmount.textContent = `$${total}`;
}

function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 0) return;
    
    const itemIndex = cart.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;
    
    if (newQuantity === 0) {
        cart.splice(itemIndex, 1);
    } else {
        cart[itemIndex].quantity = newQuantity;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
}

function removeFromCart(itemId) {
    const itemIndex = cart.findIndex(i => i.id === itemId);
    
    if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
    }
}

async function handleCheckout(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    const paymentMethod = document.getElementById('payment-method').value;
    const address = document.getElementById('address').value;

    if (!paymentMethod || !address.trim()) {
        alert('Por favor complete todos los campos');
        return;
    }
    
    try {
        const pedido = {
            id: Date.now(),
            items: JSON.parse(JSON.stringify(cart)),
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            fecha: new Date().toLocaleString(),
            metodoPago: paymentMethod,
            direccion: address,
            estado: 'Pendiente'
        };

        // Obtener pedidos existentes
        let pedidosActuales = JSON.parse(localStorage.getItem('pedidos')) || [];
        if (!Array.isArray(pedidosActuales)) pedidosActuales = [];
        
        // Agregar el nuevo pedido
        pedidosActuales.push(pedido);
        
        // Guardar en localStorage
        localStorage.setItem('pedidos', JSON.stringify(pedidosActuales));
        
        // Generar mensaje de WhatsApp
        const mensaje = generarMensajeWhatsApp(pedido);
        const numeroWhatsApp = '+5493794385978';
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        
        // Limpiar carrito
        cart = [];
        updateCartCount();
        updateCartDisplay();
        cartModal.style.display = 'none';
        
        // Mostrar mensaje de éxito
        alert('¡Pedido realizado con éxito!');
        
        // Abrir WhatsApp
        window.open(urlWhatsApp, '_blank');
    } catch (error) {
        console.error('Error al procesar el pedido:', error);
        alert('Hubo un error al procesar el pedido. Por favor, intente nuevamente.');
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function generarMensajeWhatsApp(pedido) {
    const items = pedido.items.map(item => 
        `• *${item.name}*\n   Cantidad: ${item.quantity}\n   Subtotal: $${item.price * item.quantity}`
    ).join('\n\n');

    return `🍔 *NUEVO PEDIDO #${pedido.id}* 🍔

*PRODUCTOS:*
${items}

💰 *Total:* $${pedido.total}
💳 *Método de pago:* ${pedido.metodoPago === 'mercadopago' ? 'Mercado Pago' : 'Efectivo'}
📍 *Dirección de entrega:* ${pedido.direccion}

¡Gracias por tu compra! 😊`;
}

// Función para cargar los productos en el panel de administración
function loadProductsInAdmin() {
    const productList = document.getElementById('product-list');
    if (!productList) return; // Si no estamos en la página de admin

    productList.innerHTML = burgers.map(burger => `
        <div class="product-card" data-id="${burger.id}">
            <img src="${burger.image}" alt="${burger.name}" class="product-image">
            <h3>${burger.name}</h3>
            <p>${burger.description}</p>
            <p class="item-type">Tipo: ${burger.type}</p>
            <p class="item-price">$${burger.price}</p>
            <div class="product-actions">
                <button class="edit-btn" onclick="editProduct(${burger.id})">Editar</button>
                <button class="delete-btn" onclick="deleteProduct(${burger.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Función para editar un producto
function editProduct(id) {
    const burger = burgers.find(b => b.id === id);
    if (!burger) return;

    document.getElementById('edit-id').value = burger.id;
    document.getElementById('edit-name').value = burger.name;
    document.getElementById('edit-description').value = burger.description;
    document.getElementById('edit-type').value = burger.type;
    document.getElementById('edit-price').value = burger.price;
    
    if (burger.image) {
        document.getElementById('edit-image-preview').src = burger.image;
        document.getElementById('edit-image-preview').style.display = 'block';
    }

    document.getElementById('edit-modal').style.display = 'block';
}

// Función para eliminar un producto
function deleteProduct(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        const index = burgers.findIndex(b => b.id === id);
        if (index > -1) {
            burgers.splice(index, 1);
            loadProductsInAdmin();
        }
    }
}

// Función para cerrar el modal de edición
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// Event listener para el formulario de edición
document.getElementById('edit-product-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('edit-id').value);
    const burger = burgers.find(b => b.id === id);
    
    if (burger) {
        burger.name = document.getElementById('edit-name').value;
        burger.description = document.getElementById('edit-description').value;
        burger.type = document.getElementById('edit-type').value;
        burger.price = parseInt(document.getElementById('edit-price').value);
        
        const imageFile = document.getElementById('edit-image').files[0];
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                burger.image = e.target.result;
                loadProductsInAdmin();
            };
            reader.readAsDataURL(imageFile);
        } else {
            loadProductsInAdmin();
        }
    }
    
    closeEditModal();
}); 