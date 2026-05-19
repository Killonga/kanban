// importaciones
const express = require("express");
const hbs = require("hbs");
const path = require("path");
require("dotenv").config(); // se cargan las variables de entorno desde .env
const { Tablero: Galeria, Lista: Seccion, Tarjeta: Cuadro } = require("./models"); // Alias para coherencia

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
    // Solo sincronización necesaria para la galería
    await sequelize.sync({ force: false }); 
    console.log("Base de datos sincronizada.");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
}

iniciarServidor();
