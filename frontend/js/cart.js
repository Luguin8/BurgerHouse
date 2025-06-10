// cart.js
// Este archivo contiene la lógica del carrito de compras: agregar, quitar, actualizar cantidades y renderizar el carrito.

const cartModule = {
    cart: [], // Arreglo que almacena los productos en el carrito

    /**
     * Inicializa el carrito desde localStorage y lo renderiza en pantalla.
     */
    init() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.renderCart();
        this.updateCartCount();
    },

    /**
     * Agrega una hamburguesa al carrito. Si ya existe (por id y opción), incrementa la cantidad.
     * @param {Object} burger - Objeto del producto a agregar
     */
    addToCart(burger) {
        const found = this.cart.find(item => item.id === burger.id && item.option === burger.option);
        if (found) {
            found.quantity = (found.quantity || 1) + 1;
        } else {
            this.cart.push({ ...burger, quantity: 1 });
        }
        this.saveCart();
        this.renderCart();
        this.updateCartCount();
    },

    /**
     * Elimina un producto del carrito por su índice.
     * @param {number} index - Índice del producto a eliminar
     */
    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.renderCart();
        this.updateCartCount();
    },

    /**
     * Actualiza la cantidad de un producto en el carrito.
     * @param {number} index - Índice del producto
     * @param {number} delta - Cambio en la cantidad (+1 o -1)
     */
    updateQuantity(index, delta) {
        if (this.cart[index]) {
            this.cart[index].quantity += delta;
            if (this.cart[index].quantity <= 0) {
                this.removeFromCart(index);
            } else {
                this.saveCart();
                this.renderCart();
                this.updateCartCount();
            }
        }
    },

    /**
     * Vacía el carrito completamente.
     */
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.renderCart();
        this.updateCartCount();
    },

    /**
     * Devuelve los productos actuales del carrito.
     * @returns {Array}
     */
    getCartItems() {
        return this.cart;
    },

    /**
     * Calcula el total del carrito.
     * @returns {number}
     */
    getTotal() {
        return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },

    /**
     * Guarda el carrito en localStorage.
     */
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    },

    /**
     * Actualiza el contador visual del carrito en el header.
     */
    updateCartCount() {
        document.getElementById('cart-count').textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    /**
     * Renderiza el contenido del carrito en el modal.
     */
    renderCart() {
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">El carrito está vacío</div>';
            document.getElementById('cart-total-amount').textContent = '0';
            return;
        }
        cartItems.innerHTML = this.cart.map((item, i) => `
            <div class="cart-item">
                <!--<img src="${item.image_url ? (item.image_url.startsWith('/uploads/') ? item.image_url : '/uploads/' + item.image_url.replace(/^.*[\\\/]/, '')) : item.image}" class="cart-item-image" alt="${item.name}">-->
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="item-type">${item.option ? (item.option === 'doble' ? 'Doble' : 'Simple') : ''}</div>
                    <div class="item-price">$${item.price}</div>
                    <div class="quantity-controls">
                        <button onclick="cartModule.updateQuantity(${i}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="cartModule.updateQuantity(${i}, 1)">+</button>
                        <button class="remove-item" onclick="cartModule.removeFromCart(${i})">&times;</button>
                    </div>
                </div>
            </div>
        `).join('');
        document.getElementById('cart-total-amount').textContent = this.getTotal();
    }
};

// Expone el módulo globalmente para ser usado desde el HTML inline
window.cartModule = cartModule; 