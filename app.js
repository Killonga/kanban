// importaciones
const express = require("express");
const hbs = require("hbs");
const path = require("path");
require("dotenv").config(); // se cargan las variables de entorno desde .env
const { Tablero: Galeria, Lista: Seccion, Tarjeta: Cuadro } = require("./models");

const galeriaController = require("./controllers/tableroController");
const seccionController = require("./controllers/listaController");
const cuadroController = require("./controllers/tarjetaController");

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

// pagina de inicio
app.get("/", (req, res) => {
  res.redirect("/galeria");
});

// Visualización de la Galería de Arte
app.get("/galeria", async (req, res) => {
  try {
    const galerias = await Galeria.findAll({
      include: [
        {
          model: Seccion,
          as: "listas",
          include: [
            {
              model: Cuadro,
              as: "tarjetas",
            },
          ],
        },
      ],
      order: [[{ model: Seccion, as: 'listas' }, 'id', 'ASC']]
    });

    res.render("dashboard", { 
      tableros: galerias.map(g => g.toJSON()),
      esGaleria: true 
    });
  } catch (error) {
    res.status(500).send("Error al cargar la galería");
  }
});

// muestra el formulario de edicion pre-llenado
app.get("/editar-tarjeta/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tarjeta = await Cuadro.findByPk(id);
    if (!tarjeta) return res.redirect("/galeria");
    res.render("editar-tarjeta", { tarjeta });
  } catch (error) {
    res.status(500).send("Error al cargar el cuadro");
  }
});

// Actualizar cuadro
app.post("/editar-tarjeta", async (req, res) => {
  const { id, titulo, descripcion, autor, responsable, estado } = req.body;
  try {
    const tarjeta = await Cuadro.findByPk(id);
    if (tarjeta) {
      await tarjeta.update({ titulo, descripcion, autor, responsable, estado });
    }
    res.redirect("/galeria");
  } catch (error) {
    res.status(500).send("Error al actualizar");
  }
});

// recibe el formulario de nueva tarjeta
app.post("/nueva-tarjeta", async (req, res) => {
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
    const lista = await Seccion.findOne({ where: { estado } });
    if (!lista) return res.redirect("/galeria");

    await Cuadro.create({
      titulo, descripcion, prioridad, tag, estado,
      autor, responsable, listaId: lista.id
    });

    res.redirect("/galeria");
  } catch (error) {
    res.status(500).send("Error al añadir cuadro");
  }
});

// elimina una tarjeta
app.post("/eliminar-tarjeta/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tarjeta = await Cuadro.findByPk(id);
    if (tarjeta) await tarjeta.destroy();
    res.redirect("/galeria");
  } catch (error) {
    res.status(500).send("Error al eliminar");
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
