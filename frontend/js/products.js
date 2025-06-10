// products.js
// Este archivo contiene la lógica para cargar y mostrar los productos en la página principal y para mostrar los detalles de cada hamburguesa en un modal.

/**
 * Carga los productos desde la API y los muestra en la grilla principal.
 * Solo muestra productos activos.
 */
async function loadProducts() {
    const burgerGrid = document.querySelector('.burger-grid'); // Contenedor de las hamburguesas
    try {
        const response = await fetch('http://localhost:3000/products'); // Llama a la API de productos
        const data = await response.json();
        const products = data.products || data; // Soporta respuesta paginada o no
        burgerGrid.innerHTML = products
            .filter(burger => burger.active !== false) // Solo productos activos
            .map((burger) => {
                // Renderiza cada producto como una card
                return `
                    <div class="burger-card" data-id="${burger.id}">
                        <img src="${burger.image_url ? (burger.image_url.startsWith('/uploads/') ? burger.image_url : '/uploads/' + burger.image_url.replace(/^.*[\\\/]/, '')) : burger.image}" alt="${burger.name}">
                        <h3>${burger.name}</h3>
                        <p>${burger.description}</p>
                        <p class="price">$${burger.price}</p>
                        <button class="view-details-btn" onclick="showBurgerDetails(${burger.id})">Ver Detalles</button>
                    </div>
                `;
            }).join('');
    } catch (error) {
        burgerGrid.innerHTML = '<p>Error al cargar productos.</p>';
        console.error('Error al cargar productos:', error);
    }
}

/**
 * Muestra los detalles de una hamburguesa en un modal, obteniendo la info desde la API.
 * @param {number} burgerId - ID del producto a mostrar
 */
async function showBurgerDetails(burgerId) {
    try {
        const response = await fetch(`http://localhost:3000/products/${burgerId}`);
        if (!response.ok) return;
        const burger = await response.json();
        window.currentBurger = burger; // Guarda la hamburguesa actual para otras operaciones
        document.getElementById('modal-title').textContent = burger.name;
        // document.getElementById('modal-img').src = burger.image_url ? (burger.image_url.startsWith('/uploads/') ? burger.image_url : '/uploads/' + burger.image_url.replace(/^.*[\\\/]/, '')) : burger.image;
        document.getElementById('modal-description').textContent = burger.description;
        document.getElementById('modal-type').textContent = `Tipo: ${burger.category || burger.type}`;
        document.getElementById('modal-price').textContent = `Precio: $${burger.price}`;
        document.getElementById('simple-price').textContent = `$${burger.price}`;
        document.getElementById('doble-price').textContent = `$${burger.price + 500}`;
        document.getElementById('burger-modal').style.display = 'block';
    } catch (error) {
        alert('Error al cargar detalles del producto');
    }
}

// Expone las funciones globalmente para ser usadas desde el HTML inline
window.loadProducts = loadProducts;
window.showBurgerDetails = showBurgerDetails; 