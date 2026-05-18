// routes/api.js
// se definen todas las rutas protegidas de la API, requieren token valido

const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');

const { getTableros, crearTablero, actualizarTablero, eliminarTablero } = require('../controllers/tableroController');
const { crearLista, actualizarLista, eliminarLista } = require('../controllers/listaController');
const { crearTarjeta, actualizarTarjeta, eliminarTarjeta } = require('../controllers/tarjetaController');

// se aplica el middleware a todas las rutas de este router
router.use(verificarToken);

// rutas de tableros
router.get('/tableros', getTableros);
router.post('/tableros', crearTablero);
router.put('/tableros/:id', actualizarTablero);
router.delete('/tableros/:id', eliminarTablero);

// rutas de listas
router.post('/tableros/:tableroId/listas', crearLista);
router.put('/tableros/:tableroId/listas/:id', actualizarLista);
router.delete('/tableros/:tableroId/listas/:id', eliminarLista);

// rutas de tarjetas
router.post('/listas/:listaId/tarjetas', crearTarjeta);
router.put('/listas/:listaId/tarjetas/:id', actualizarTarjeta);
router.delete('/listas/:listaId/tarjetas/:id', eliminarTarjeta);

module.exports = router;