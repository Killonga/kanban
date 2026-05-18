// controllers/tableroController.js
// se maneja la logica CRUD para los tableros del usuario autenticado

const { Tablero } = require('../models');

// obtener todos los tableros del usuario autenticado
async function getTableros(req, res) {
  try {
    // se usa req.usuario.id que dejo el middleware de autenticacion
    const tableros = await Tablero.findAll({
      where: { usuarioId: req.usuario.id }
    });

    res.json(tableros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los tableros' });
  }
}

// crear un nuevo tablero
async function crearTablero(req, res) {
  const { nombre, descripcion } = req.body;

  try {
    const tablero = await Tablero.create({
      nombre,
      descripcion,
      usuarioId: req.usuario.id // se asocia el tablero al usuario autenticado
    });

    res.status(201).json(tablero);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el tablero' });
  }
}

// actualizar un tablero existente
async function actualizarTablero(req, res) {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    // se busca el tablero y se verifica que pertenezca al usuario autenticado
    const tablero = await Tablero.findOne({
      where: { id, usuarioId: req.usuario.id }
    });

    if (!tablero) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    await tablero.update({ nombre, descripcion });
    res.json(tablero);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el tablero' });
  }
}

// eliminar un tablero
async function eliminarTablero(req, res) {
  const { id } = req.params;

  try {
    // se verifica que el tablero pertenezca al usuario antes de eliminarlo
    const tablero = await Tablero.findOne({
      where: { id, usuarioId: req.usuario.id }
    });

    if (!tablero) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    await tablero.destroy();
    res.json({ mensaje: 'Tablero eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el tablero' });
  }
}

module.exports = { getTableros, crearTablero, actualizarTablero, eliminarTablero };