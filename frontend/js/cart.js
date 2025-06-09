const cartModule = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],

    addToCart(item) {
        const existingItem = this.cart.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...item,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
        this.showNotification(`${item.name} añadido al carrito`);
    },

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cart-count').textContent = totalItems;
    },

    updateCartDisplay() {
        const cartItems = document.getElementById('cart-items');
        const cartTotalAmount = document.getElementById('cart-total-amount');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">No hay productos en el carrito</p>';
            cartTotalAmount.textContent = '0';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="item-type">${item.type}</p>
                    <p class="item-price">$${item.price}</p>
                    <div class="quantity-controls">
                        <button onclick="cartModule.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="cartModule.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="cartModule.removeFromCart(${item.id})">×</button>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalAmount.textContent = total;
    },

    updateQuantity(itemId, newQuantity) {
        if (newQuantity < 0) return;
        
        const itemIndex = this.cart.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;
        
        if (newQuantity === 0) {
            this.cart.splice(itemIndex, 1);
        } else {
            this.cart[itemIndex].quantity = newQuantity;
        }
        
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
    },

    removeFromCart(itemId) {
        const itemIndex = this.cart.findIndex(i => i.id === itemId);
        
        if (itemIndex > -1) {
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartCount();
            this.updateCartDisplay();
        }
    },

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    },

    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    },

    showCart() {
        this.updateCartDisplay();
        document.getElementById('cart-modal').style.display = 'block';
    },

    init() {
        this.updateCartCount();
        
        // Event Listeners
        document.querySelector('.cart-icon').addEventListener('click', () => this.showCart());
        
        // Cerrar modal del carrito
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                document.getElementById('cart-modal').style.display = 'none';
            });
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            const cartModal = document.getElementById('cart-modal');
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });

        // Formulario de checkout
        document.getElementById('checkout-form').addEventListener('submit', this.handleCheckout.bind(this));
    },

    handleCheckout(e) {
        e.preventDefault();
        
        const paymentMethod = document.getElementById('payment-method').value;
        const observations = document.getElementById('observations').value;
        const deliveryType = document.querySelector('.delivery-option.selected')?.textContent.trim();
        const address = document.getElementById('address').value;

        if (!paymentMethod || !deliveryType) {
            this.showNotification('Por favor complete todos los campos requeridos');
            return;
        }

        if (deliveryType === 'Delivery' && !address) {
            this.showNotification('Por favor ingrese una dirección de entrega');
            return;
        }

        // Crear el objeto del pedido
        const order = {
            items: [...this.cart],
            paymentMethod,
            deliveryType,
            address: deliveryType === 'Delivery' ? address : 'Retira en local',
            observations: observations || 'Sin observaciones',
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: new Date().toISOString(),
            status: 'pendiente'
        };

        // Obtener pedidos existentes y agregar el nuevo
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Limpiar carrito
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
        
        // Cerrar modal y mostrar confirmación
        document.getElementById('cart-modal').style.display = 'none';
        this.showNotification('¡Pedido realizado con éxito!');

        // Limpiar formulario
        document.getElementById('payment-method').value = '';
        document.getElementById('address').value = '';
        document.getElementById('observations').value = '';
        document.querySelectorAll('.delivery-option').forEach(opt => {
            opt.classList.remove('selected');
        });
    }
}; 