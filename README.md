# Burger House 🍔

Aplicación web de comida rápida desarrollada con HTML, CSS y JavaScript vanilla para el frontend, y Node.js con Express para el backend.

## Características 🌟

- Catálogo de productos con imágenes y descripciones detalladas (desde la base de datos, vía API REST)
- Sistema de carrito de compras en el frontend
- Opciones de personalización (hamburguesa simple/doble)
- Sistema de pedidos con opciones de entrega, integrados con la base de datos
- Panel de administración para gestión de productos y pedidos (CRUD completo vía API)
- Diseño responsive y moderno
- Tema oscuro para mejor experiencia visual

## Tecnologías Utilizadas 💻

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (Vanilla)
  - Consumo de API REST para productos y pedidos

- Backend:
  - Node.js
  - Express
  - SQLite
  - JWT para autenticación (solo en backend, autenticación básica en admin por ahora)

## Estructura del Proyecto 📁

```
burger-house/
├── frontend/           # Archivos del frontend
│   ├── index.html     # Página principal
│   ├── admin.html     # Panel de administración
│   ├── styles.css     # Estilos globales
│   └── assets/        # Imágenes y recursos
├── backend/           # Código del servidor y API REST
│   ├── index.js       # Punto de entrada del backend
│   ├── routes/        # Rutas de la API (productos, pedidos, auth)
│   ├── data/          # Base de datos SQLite
│   └── uploads/       # Imágenes subidas por el admin
├── documentacion/     # Notas y documentación interna
└── README.md          # Este archivo
```

## Flujo de trabajo actualizado 🚀

- El frontend **NO usa localStorage** para productos ni pedidos. Todo se gestiona vía API REST.
- El panel de administración permite crear, editar, eliminar y activar/desactivar productos, todo conectado a la base de datos.
- Los pedidos se envían al backend y se almacenan en la base de datos.
- El backend expone endpoints REST para productos y pedidos.

## Características del Panel de Administración 👨‍💼

- Gestión completa de productos (CRUD)
- Visualización y gestión de pedidos
- Exportación de pedidos a CSV (próximamente)
- Control de stock (próximamente)

## Contribuir 🤝

1. Haz un Fork del proyecto
2. Crea una rama para tu función (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia 📄

Este proyecto está protegido bajo una licencia propietaria. Todos los derechos están reservados y su uso, modificación o distribución está estrictamente prohibido sin autorización expresa por escrito.

## Contacto 📧

Luguin - [martinlugo65@gmail.com](mailto:martinlugo65@gmail.com)

Link del proyecto: [https://github.com/Luguin8/BurgerHouse](https://github.com/Luguin8/BurgerHouse) 