// controllers/listaController.js
// se maneja la logica CRUD para las listas dentro de un tablero

const { Lista, Tablero } = require('../models');

// crear una nueva lista dentro de un tablero
async function crearLista(req, res) {
  const { tableroId } = req.params;
  const { nombre, estado } = req.body;

  try {
    // se verifica que el tablero exista y pertenezca al usuario autenticado
    const tablero = await Tablero.findOne({
      where: { id: tableroId, usuarioId: req.usuario.id }
    });

    if (!tablero) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    const lista = await Lista.create({ nombre, estado, tableroId });
    res.status(201).json(lista);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la lista' });
  }
}

// actualizar una lista existente
async function actualizarLista(req, res) {
  const { tableroId, id } = req.params;
  const { nombre, estado } = req.body;

  try {
    // se verifica que el tablero pertenezca al usuario antes de modificar la lista
    const tablero = await Tablero.findOne({
      where: { id: tableroId, usuarioId: req.usuario.id }
    });

    if (!tablero) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    const lista = await Lista.findOne({ where: { id, tableroId } });

    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    await lista.update({ nombre, estado });
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la lista' });
  }
}

// eliminar una lista
async function eliminarLista(req, res) {
  const { tableroId, id } = req.params;

  try {
    // se verifica que el tablero pertenezca al usuario antes de eliminar la lista
    const tablero = await Tablero.findOne({
      where: { id: tableroId, usuarioId: req.usuario.id }
    });

    if (!tablero) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    const lista = await Lista.findOne({ where: { id, tableroId } });

    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    await lista.destroy();
    res.json({ mensaje: 'Lista eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la lista' });
  }
}

module.exports = { crearLista, actualizarLista, eliminarLista };