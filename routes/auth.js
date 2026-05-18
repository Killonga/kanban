// routes/auth.js
// se definen las rutas publicas de autenticacion, no requieren token

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// POST /api/auth/register - crear un nuevo usuario
router.post('/register', register);

// POST /api/auth/login - iniciar sesion y obtener token
router.post('/login', login);

module.exports = router;