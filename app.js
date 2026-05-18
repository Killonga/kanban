// importaciones
const express = require("express");
const hbs = require("hbs");
const path = require("path");
const session = require("express-session");
require("dotenv").config(); // se cargan las variables de entorno desde .env
const bcrypt = require("bcryptjs");
const { Tablero, Lista, Tarjeta, Usuario } = require("./models");

const authRoutes = require("./routes/auth"); // se importan las rutas de autenticacion
const apiRoutes = require("./routes/api"); // se importan las rutas protegidas de la API

const app = express();
const PORT = process.env.PORT || 3000;

// motor de vistas
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views/layouts"));

// le decimos cual es el layout principal
const hbsEngine = require("hbs");
hbsEngine.__express = hbsEngine.__express;
app.set("view options", { layout: "layouts/layout" });

// helper para comparar dos valores en las vistas
hbs.registerHelper("eq", (a, b) => a === b);

// middlewares
app.use(express.static(path.join(__dirname, "public"))); // sirve el css, imagenes, etc
app.use(express.urlencoded({ extended: false })); // para leer los datos del formulario
app.use(express.json()); // se habilita la lectura de JSON en el cuerpo del request

// rutas de la API
app.use("/api/auth", authRoutes); // se montan las rutas de autenticacion
app.use("/api", apiRoutes); // se montan las rutas protegidas bajo el prefijo /api

// configuracion de sesiones
app.use(
  session({
    secret: "kanbanpro-secret", // palabra secreta para firmar la cookie
    resave: false, // no guardar la sesion si no cambio nada
    saveUninitialized: false, // no crear sesion hasta que haya algo que guardar
  }),
);

// middleware que verifica si hay sesion activa
// si no hay sesion, manda al login
function verificarSesion(req, res, next) {
  if (req.session.usuario) {
    next(); // hay sesion, puede continuar
  } else {
    res.redirect("/login"); // no hay sesion, al login
  }
}

// pagina de inicio
app.get("/", (req, res) => {
  res.render("home");
});

// pagina de registro
app.get("/register", (req, res) => {
  res.render("register");
});

// pagina de login
app.get("/login", (req, res) => {
  res.render("login");
});

// dashboard - protegido, solo entra si hay sesion activa
app.get("/dashboard", verificarSesion, async (req, res) => {
  try {
    // se obtienen todos los tableros del usuario con sus listas y tarjetas anidadas
    const tableros = await Tablero.findAll({
      where: { usuarioId: req.session.usuario.id },
      include: [
        {
          model: Lista,
          as: "listas",
          include: [
            {
              model: Tarjeta,
              as: "tarjetas",
            },
          ],
          order: [["id", "ASC"]], // se ordenan las listas por id ascendente
        },
      ],
    });

    // se define el orden correcto de las listas
    const ordenListas = ["Backlog", "Doing", "Review", "Done"];

    // se convierten a objetos planos y se ordenan las listas de cada tablero
    const tablerosPlanos = tableros.map((t) => {
      const tablero = t.toJSON();
      tablero.listas = tablero.listas.sort((a, b) => {
        return ordenListas.indexOf(a.estado) - ordenListas.indexOf(b.estado);
      });
      return tablero;
    });

    res.render("dashboard", {
      tableros: tablerosPlanos,
      usuario: req.session.usuario,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar el dashboard");
  }
});

// recibe el formulario de login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // se busca el usuario en la base de datos
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.render("login", { error: "El email no esta registrado" });
    }

    // se compara la contrasena ingresada contra el hash guardado
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.render("login", { error: "Contrasena incorrecta" });
    }

    // se guarda el usuario en la sesion
    req.session.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
    };

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al iniciar sesion");
  }
});

// recibe el formulario de registro
app.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // se verifica que el email no este ya registrado
    const usuarioExistente = await Usuario.findOne({ where: { email } });

    if (usuarioExistente) {
      return res.render("register", { error: "Ese email ya esta registrado" });
    }

    // se hashea la contrasena antes de guardarla
    const passwordHasheada = await bcrypt.hash(password, 10);

    // se crea el usuario en la base de datos
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: passwordHasheada,
    });

    // se crea un tablero por defecto para el nuevo usuario
    const tableroDefault = await Tablero.create({
      nombre: "Mi primer tablero",
      descripcion: "Tablero creado automaticamente",
      usuarioId: nuevoUsuario.id,
    });

    // se crean las cuatro listas por defecto dentro del tablero
    await Lista.bulkCreate([
      { nombre: "Backlog", estado: "Backlog", tableroId: tableroDefault.id },
      { nombre: "Doing", estado: "Doing", tableroId: tableroDefault.id },
      { nombre: "Review", estado: "Review", tableroId: tableroDefault.id },
      { nombre: "Done", estado: "Done", tableroId: tableroDefault.id },
    ]);

    // se inicia sesion automaticamente con el nuevo usuario
    req.session.usuario = {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
    };

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al registrar el usuario");
  }
});

// cerrar sesion
app.get("/logout", (req, res) => {
  req.session.destroy(); // borramos la sesion
  res.redirect("/login");
});

// muestra el formulario de edicion pre-llenado
app.get("/editar-tarjeta/:id", verificarSesion, async (req, res) => {
  const { id } = req.params;

  try {
    // se busca la tarjeta por su id en la base de datos
    const tarjeta = await Tarjeta.findByPk(id);

    if (!tarjeta) {
      return res.redirect("/dashboard");
    }

    res.render("editar-tarjeta", { tarjeta });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar la tarjeta");
  }
});

// recibe el formulario de edicion y actualiza la tarjeta
app.post("/editar-tarjeta", verificarSesion, async (req, res) => {
  const {
    id,
    titulo,
    descripcion,
    prioridad,
    tag,
    estado,
    fecha_inicio,
    fecha_fin,
    autor,
    responsable,
  } = req.body;

  try {
    // se busca la tarjeta por su id
    const tarjeta = await Tarjeta.findByPk(id);

    if (!tarjeta) {
      return res.redirect("/dashboard");
    }

    // se busca la lista que corresponde al nuevo estado
    const listaDestino = await Lista.findOne({
      where: { estado },
      include: [
        {
          model: Tablero,
          as: "tablero",
          where: { usuarioId: req.session.usuario.id },
        },
      ],
    });

    // se actualiza la tarjeta con los nuevos datos y la nueva lista
    await tarjeta.update({
      titulo,
      descripcion,
      prioridad,
      tag,
      estado,
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      autor,
      responsable,
      listaId: listaDestino ? listaDestino.id : tarjeta.listaId,
    });

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al actualizar la tarjeta");
  }
});

// recibe el formulario de nueva tarjeta
app.post("/nueva-tarjeta", verificarSesion, async (req, res) => {
  const {
    titulo,
    descripcion,
    prioridad,
    tag,
    estado,
    fecha_inicio,
    fecha_fin,
    autor,
    responsable,
  } = req.body;

  try {
    // se busca la primera lista del usuario que coincida con el estado elegido
    const lista = await Lista.findOne({
      where: { estado },
      include: [
        {
          model: Tablero,
          as: "tablero",
          where: { usuarioId: req.session.usuario.id },
        },
      ],
    });

    if (!lista) {
      return res.redirect("/dashboard");
    }

    // se crea la tarjeta asociada a la lista encontrada
    await Tarjeta.create({
      titulo,
      descripcion: descripcion || "",
      prioridad: prioridad || "Task",
      tag: tag || "FEATURE",
      estado: estado || "Backlog",
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      autor: autor || "Anonimo",
      responsable: responsable || "",
      listaId: lista.id,
    });

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al crear la tarjeta");
  }
});

// elimina una tarjeta
app.post("/eliminar-tarjeta/:id", verificarSesion, async (req, res) => {
  const { id } = req.params;

  try {
    // se busca la tarjeta por su id
    const tarjeta = await Tarjeta.findByPk(id);

    if (!tarjeta) {
      return res.redirect("/dashboard");
    }

    // se elimina la tarjeta de la base de datos
    await tarjeta.destroy();
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al eliminar la tarjeta");
  }
});

// iniciar servidor
// se sincronizan los modelos con la base de datos antes de arrancar
const { sequelize } = require("./models");

async function iniciarServidor() {
  try {
    // se sincronizan los modelos con la base de datos
    await sequelize.sync({ alter: true });
    console.log("Base de datos sincronizada.");

    // se verifica si el usuario demo ya existe
    const usuarioDemo = await Usuario.findOne({
      where: { email: "demo@kanbanpro.com" },
    });

    if (!usuarioDemo) {
      // se crea el usuario demo con la contrasena hasheada
      const passwordHasheada = await bcrypt.hash("123456", 10);
      const usuario = await Usuario.create({
        nombre: "Usuario Test",
        email: "test@kanbanpro.com",
        password: passwordHasheada,
      });

      // se crea el tablero y las listas por defecto para el usuario demo
      const tablero = await Tablero.create({
        nombre: "Tablero de ejemplo",
        descripcion: "Tablero creado automaticamente para el usuario demo",
        usuarioId: usuario.id,
      });

      const [backlog] = await Lista.bulkCreate([
        { nombre: "Backlog", estado: "Backlog", tableroId: tablero.id },
        { nombre: "Doing", estado: "Doing", tableroId: tablero.id },
        { nombre: "Review", estado: "Review", tableroId: tablero.id },
        { nombre: "Done", estado: "Done", tableroId: tablero.id },
      ]);

      await Tarjeta.create({
        titulo: "Bienvenido a KanbanPro",
        descripcion: "Esta es una tarjeta de ejemplo",
        prioridad: "Task",
        tag: "FEATURE",
        estado: "Backlog",
        autor: "Usuario Demo",
        listaId: backlog.id,
      });

      console.log("Usuario demo creado correctamente.");
    }

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
}

iniciarServidor();
