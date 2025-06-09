const productsModule = {
    products: [
        {
            id: 1,
            name: "Clásica",
            description: "Medallón de carne, lechuga, tomate, cebolla y nuestra salsa especial",
            type: "Común",
            price: 1500,
            image: "https://via.placeholder.com/200x200",
            active: true
        },
        {
            id: 2,
            name: "Doble Cheddar",
            description: "Doble medallón de carne, doble cheddar, bacon y salsa barbacoa",
            type: "Especial",
            price: 2200,
            image: "https://via.placeholder.com/200x200",
            active: true
        },
        {
            id: 3,
            name: "BBQ Bacon",
            description: "Medallón de carne, bacon crocante, cebolla caramelizada y salsa BBQ",
            type: "Especial",
            price: 2000,
            image: "https://via.placeholder.com/200x200",
            active: true
        },
        {
            id: 4,
            name: "Mexicana",
            description: "Medallón de carne, guacamole, jalapeños, nachos y salsa picante",
            type: "Especial",
            price: 1900,
            image: "https://via.placeholder.com/200x200",
            active: true
        },
        {
            id: 5,
            name: "Veggie",
            description: "Medallón de lentejas y vegetales, lechuga, tomate y mayonesa vegana",
            type: "Común",
            price: 1700,
            image: "https://via.placeholder.com/200x200",
            active: true
        },
        {
            id: 6,
            name: "La Gigante",
            description: "Triple medallón de carne, triple cheddar, bacon, huevo y salsa especial",
            type: "Especial",
            price: 2500,
            image: "https://via.placeholder.com/200x200",
            active: true
        }
    ],

    getAllProducts() {
        return this.products;
    },

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }
};

// Funciones de manejo de productos
function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

function initializeProducts() {
    if (!localStorage.getItem('products')) {
        saveProducts(productsModule.products);
    }
}

// Inicializar productos al cargar
initializeProducts();

// Exportar funciones y datos
window.productsModule = {
    getAllProducts,
    saveProducts,
    initializeProducts,
    getProductById: productsModule.getProductById
}; 