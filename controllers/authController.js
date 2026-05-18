// controllers/authController.js
// se maneja la logica de registro e inicio de sesion de usuarios

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// registrar un nuevo usuario
async function register(req, res) {
  const { nombre, email, password } = req.body;

  try {
    // se verifica que el email no este ya registrado
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El email ya esta registrado' });
    }

    // se hashea la contrasena antes de guardarla, el numero 10 es el costo del proceso
    const passwordHasheada = await bcrypt.hash(password, 10);

    // se crea el usuario con la contrasena hasheada, nunca la original
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: passwordHasheada
    });

    res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      usuario: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email }
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
}

// iniciar sesion
async function login(req, res) {
  const { email, password } = req.body;

  try {
    // se busca el usuario por email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // se compara la contrasena ingresada contra el hash guardado en la base de datos
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // se genera el token con los datos del usuario y una expiracion de 24 horas
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesion' });
  }
}

module.exports = { register, login };