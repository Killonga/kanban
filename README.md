# KanbanPro

Aplicacion de tablero Kanban con autenticacion de usuarios y persistencia en base de datos, construida con Node.js, Express y PostgreSQL.

## Tecnologias utilizadas

- Node.js con Express 5
- Handlebars como motor de vistas
- PostgreSQL como base de datos
- Sequelize como ORM
- express-session para manejo de sesiones
- bcryptjs para hasheo de contrasenas
- jsonwebtoken para autenticacion via JWT

## Estructura del proyecto

    kanbanpro/
    ├── controllers/
    │   ├── authController.js
    │   ├── tableroController.js
    │   ├── listaController.js
    │   └── tarjetaController.js
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   ├── index.js
    │   ├── Usuario.js
    │   ├── Tablero.js
    │   ├── Lista.js
    │   └── Tarjeta.js
    ├── routes/
    │   ├── auth.js
    │   └── api.js
    ├── public/
    │   └── css/
    │       └── style.css
    ├── views/
    │   ├── layouts/
    │   │   └── layout.hbs
    │   ├── dashboard.hbs
    │   ├── editar-tarjeta.hbs
    │   ├── home.hbs
    │   ├── login.hbs
    │   └── register.hbs
    ├── app.js
    ├── seed.js
    ├── test-crud.js
    ├── .env
    ├── .gitignore
    ├── package.json
    └── README.md

## Modelo de datos

Un usuario puede tener muchos tableros.
Un tablero puede tener muchas listas.
Una lista puede tener muchas tarjetas.

## Historial de sprints

### Sprint 1: Prototipo funcional con persistencia en archivos

El objetivo de este sprint fue construir la aplicacion web inicial renderizada desde el servidor. Se implemento la navegacion basica con las paginas de inicio, login y registro. El dashboard leia y mostraba datos desde un archivo data.json usando el modulo fs de Node.js. Se implemento la creacion de tarjetas con persistencia en el mismo archivo JSON siguiendo el ciclo leer, modificar y escribir. La autenticacion se manejaba con express-session y las contrasenas se guardaban en texto plano en un archivo users.json.

### Sprint 2: Arquitectura de datos con PostgreSQL y Sequelize

El objetivo de este sprint fue reemplazar la persistencia en archivos por una base de datos real. Se configuraron los modelos de Sequelize para Usuario, Tablero, Lista y Tarjeta con sus relaciones uno a muchos. Se creo un script seed.js para poblar la base de datos con datos de prueba y un script test-crud.js para verificar las operaciones CRUD de forma aislada. La interfaz web siguio funcionando con los datos del Sprint 1 mientras se construia la capa de datos de forma desacoplada.

### Sprint 3: API RESTful, seguridad y funcionalidad completa

El objetivo de este sprint fue conectar todas las piezas para lograr un MVP funcional. Se implemento un sistema de autenticacion seguro con JWT y bcryptjs para el hasheo de contrasenas. Se construyo una API RESTful completa con endpoints CRUD para tableros, listas y tarjetas, todos protegidos por un middleware que verifica el token en cada request. Finalmente se conecto el dashboard a la base de datos real, reemplazando los datos simulados del Sprint 1 por consultas reales con Sequelize usando Eager Loading.

## Instalacion

1. Instalar dependencias

    npm install

2. Configurar variables de entorno

    Crear un archivo .env en la raiz del proyecto con las siguientes variables:

    DB_NAME=kanban_db_46vo
    DB_USER=kanban_db_46vo_user
    DB_PASSWORD=NsAqmRgj7BzqBAUNUysEdvVrkKpFT4JF  
    DB_HOST=localhost
    DB_PORT=5432
    JWT_SECRET=NsAqmRgj7BzqBAUNUysEdvVrkKpFT4JF

3. Poblar la base de datos

    npm run seed

4. Iniciar el servidor

    npm start

    Abrir el navegador en http://localhost:3000

## Despliegue en Render.com

Este proyecto está configurado para desplegarse fácilmente en Render.

### 1. Preparar la Base de Datos
1. En el dashboard de Render, crea un nuevo servicio de **PostgreSQL**.
2. Copia la **Internal Database URL** (si el servicio estará en la misma región) o la **External Database URL**.

### 2. Crear el Web Service
1. Crea un nuevo **Web Service** y conecta este repositorio.
2. Configura los siguientes campos:
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Variables de Entorno
En la sección "Environment" del servicio en Render, añade:

- `DATABASE_URL`: La URL de conexión de tu base de datos PostgreSQL de Render.
- `JWT_SECRET`: Una cadena aleatoria y segura para firmar los tokens.
- `NODE_ENV`: `production`

### 4. Sincronización Automática
El servidor está configurado para ejecutar `sequelize.sync({ alter: true })` al iniciar, lo que mantendrá las tablas actualizadas en Render sin perder datos existentes (ideal para prototipos rápidos).

Para poblar datos iniciales en producción, puedes ejecutar temporalmente el script de seed desde una terminal remota si es necesario, aunque el `app.js` ya crea un usuario de prueba si no existe ninguno.

## Scripts disponibles

- npm start: inicia el servidor web
- npm run seed: crea las tablas y puebla la base de datos con datos de prueba
- npm run test:crud: verifica las operaciones CRUD de forma aislada

## API RESTful

La API usa autenticacion basada en JWT. Para acceder a los endpoints protegidos se debe incluir el token en el header de cada request:

    Authorization: Bearer <token>

### Autenticacion

Estos endpoints son publicos y no requieren token.

#### POST /api/auth/register

Registra un nuevo usuario.

Body:

    {
      "nombre": "Usuario Ejemplo",
      "email": "usuario@ejemplo.com",
      "password": "123456"
    }

Respuesta exitosa (201):

    {
      "mensaje": "Usuario creado correctamente",
      "usuario": {
        "id": 1,
        "nombre": "Usuario Ejemplo",
        "email": "usuario@ejemplo.com"
      }
    }

#### POST /api/auth/login

Inicia sesion y devuelve un token JWT.

Body:

    {
      "email": "usuario@ejemplo.com",
      "password": "123456"
    }

Respuesta exitosa (200):

    {
      "token": "eyJhbGci..."
    }

### Tableros

Todos estos endpoints requieren token.

#### GET /api/tableros

Devuelve todos los tableros del usuario autenticado.

Respuesta exitosa (200):

    [
      {
        "id": 1,
        "nombre": "Proyecto Web",
        "descripcion": "Tablero principal",
        "usuarioId": 1
      }
    ]

#### POST /api/tableros

Crea un nuevo tablero.

Body:

    {
      "nombre": "Proyecto Web",
      "descripcion": "Tablero principal"
    }

Respuesta exitosa (201):

    {
      "id": 1,
      "nombre": "Proyecto Web",
      "descripcion": "Tablero principal",
      "usuarioId": 1
    }

#### PUT /api/tableros/:id

Actualiza un tablero existente.

Body:

    {
      "nombre": "Nuevo nombre",
      "descripcion": "Nueva descripcion"
    }

Respuesta exitosa (200): devuelve el tablero actualizado.

#### DELETE /api/tableros/:id

Elimina un tablero.

Respuesta exitosa (200):

    {
      "mensaje": "Tablero eliminado correctamente"
    }

### Listas

Todos estos endpoints requieren token.

#### POST /api/tableros/:tableroId/listas

Crea una nueva lista dentro de un tablero.

Body:

    {
      "nombre": "Backlog",
      "estado": "Backlog"
    }

Los valores validos para estado son: Backlog, Doing, Review, Done.

Respuesta exitosa (201):

    {
      "id": 1,
      "nombre": "Backlog",
      "estado": "Backlog",
      "tableroId": 1
    }

#### PUT /api/tableros/:tableroId/listas/:id

Actualiza una lista existente.

Body:

    {
      "nombre": "Nuevo nombre",
      "estado": "Doing"
    }

Respuesta exitosa (200): devuelve la lista actualizada.

#### DELETE /api/tableros/:tableroId/listas/:id

Elimina una lista.

Respuesta exitosa (200):

    {
      "mensaje": "Lista eliminada correctamente"
    }

### Tarjetas

Todos estos endpoints requieren token.

#### POST /api/listas/:listaId/tarjetas

Crea una nueva tarjeta dentro de una lista.

Body:

    {
      "titulo": "Disenar la pantalla de login",
      "descripcion": "Crear el formulario con validaciones",
      "prioridad": "Task",
      "tag": "FEATURE",
      "estado": "Backlog",
      "fecha_inicio": "2026-04-01",
      "fecha_fin": "2026-04-10",
      "autor": "Cristian",
      "responsable": "Cristian"
    }

Los valores validos para prioridad son: Feature, Task, Bug, Improvement.
Los valores validos para tag son: FEATURE, BUG, HOTFIX.
Los valores validos para estado son: Backlog, Doing, Review, Done.

Respuesta exitosa (201): devuelve la tarjeta creada.

#### PUT /api/listas/:listaId/tarjetas/:id

Actualiza una tarjeta existente. Acepta los mismos campos que el POST.

Respuesta exitosa (200): devuelve la tarjeta actualizada.

#### DELETE /api/listas/:listaId/tarjetas/:id

Elimina una tarjeta.

Respuesta exitosa (200):

    {
      "mensaje": "Tarjeta eliminada correctamente"
    }

## Conceptos aplicados

- hasMany y belongsTo: relaciones uno a muchos entre los modelos
- foreignKey: clave foranea explicita en cada relacion
- as: alias necesario para el Eager Loading
- Eager Loading: consultas con include para obtener datos relacionados en una sola query
- bulkCreate: insercion de multiples registros en una sola operacion
- sync force true: elimina y recrea las tablas, solo para desarrollo
- bcryptjs: hasheo de contrasenas antes de guardarlas en la base de datos
- JWT: autenticacion sin estado mediante tokens firmados
- Middleware: verificacion del token en cada request protegido

## Credenciales de prueba

    Email:    test@kanbanpro.com
    Password: 123456