# GaleriaPro

Aplicación de Galería de Arte con visualización de cuadros y marcos, construida con Node.js, Express y PostgreSQL.

## Estructura del proyecto

    galeriapro/
    ├── controllers/
    │   ├── galeriaController.js   (anteriormente tableroController)
    │   ├── seccionController.js   (anteriormente listaController)
    │   └── cuadroController.js    (anteriormente tarjetaController)
    ├── models/
    │   ├── index.js
    │   ├── Galeria.js
    │   ├── Seccion.js
    │   └── Cuadro.js
    ├── public/
    │   └── css/
    │       └── style.css          (incluye estilos para marcos de cuadros)
    ├── views/
    │   ├── layouts/
    │   │   └── layout.hbs
    │   ├── gallery.hbs            (anteriormente dashboard)
    │   ├── editar-cuadro.hbs      (anteriormente editar-tarjeta)
    │   └── home.hbs
    ├── app.js                     (punto de entrada simplificado sin auth)
    ├── seed.js                    (población con datos artísticos)
    ├── .env                       (configuración de DB)
    └── READMEII.md

## Conceptos de Negocio

- **Galería**: Es el contenedor principal (equivalente al Tablero).
- **Sección/Muro**: Columnas que agrupan cuadros por temática o estado (equivalente a Listas).
- **Cuadro**: El elemento artístico individual con su propio "marco" visual (equivalente a Tarjetas).

## Instalación y Uso

1. Configurar el archivo `.env` con las credenciales de PostgreSQL.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Poblar la base de datos con obras de arte:
   ```bash
   npm run seed
   ```
4. Iniciar la galería:
   ```bash
   npm start
   ```

## Cambios Realizados
- Se eliminó el sistema de login y registro.
- Se rediseñó el CSS para aplicar estilos de "marcos" a las tarjetas de cuadros.
- Refactorización semántica del Backend (Tableros -> Galerías).