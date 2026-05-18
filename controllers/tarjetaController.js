// controllers/tarjetaController.js
// se maneja la logica CRUD para las tarjetas dentro de una lista

const { Tarjeta, Lista, Tablero } = require('../models');

// crear una nueva tarjeta dentro de una lista
async function crearTarjeta(req, res) {
  const { listaId } = req.params;
  const { titulo, descripcion, prioridad, tag, estado, fecha_inicio, fecha_fin, autor, responsable } = req.body;

  try {
    // se verifica que la lista exista y pertenezca a un tablero del usuario autenticado
    const lista = await Lista.findOne({
      where: { id: listaId },
      include: [{ model: Tablero, as: 'tablero', where: { usuarioId: req.usuario.id } }]
    });

    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    const tarjeta = await Tarjeta.create({
      titulo, descripcion, prioridad, tag, estado,
      fecha_inicio, fecha_fin, autor, responsable,
      listaId
    });

    res.status(201).json(tarjeta);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarjeta' });
  }
}

// actualizar una tarjeta existente
async function actualizarTarjeta(req, res) {
  const { listaId, id } = req.params;
  const { titulo, descripcion, prioridad, tag, estado, fecha_inicio, fecha_fin, autor, responsable } = req.body;

  try {
    // se verifica que la lista pertenezca a un tablero del usuario autenticado
    const lista = await Lista.findOne({
      where: { id: listaId },
      include: [{ model: Tablero, as: 'tablero', where: { usuarioId: req.usuario.id } }]
    });

    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    const tarjeta = await Tarjeta.findOne({ where: { id, listaId } });

    if (!tarjeta) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    await tarjeta.update({
      titulo, descripcion, prioridad, tag, estado,
      fecha_inicio, fecha_fin, autor, responsable
    });

    res.json(tarjeta);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la tarjeta' });
  }
}

// eliminar una tarjeta
async function eliminarTarjeta(req, res) {
  const { listaId, id } = req.params;

  try {
    // se verifica que la lista pertenezca a un tablero del usuario autenticado
    const lista = await Lista.findOne({
      where: { id: listaId },
      include: [{ model: Tablero, as: 'tablero', where: { usuarioId: req.usuario.id } }]
    });

    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    const tarjeta = await Tarjeta.findOne({ where: { id, listaId } });

    if (!tarjeta) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    await tarjeta.destroy();
    res.json({ mensaje: 'Tarjeta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la tarjeta' });
  }
}

module.exports = { crearTarjeta, actualizarTarjeta, eliminarTarjeta };