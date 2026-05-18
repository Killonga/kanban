// middleware/auth.js
// se verifica que el request tenga un token JWT valido antes de continuar

const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  // se lee el header Authorization del request
  const authHeader = req.headers['authorization'];

  // si no viene el header, se rechaza el request
  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  // el header viene como "Bearer eltoken123", se separa para quedarse solo con el token
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Formato de token invalido' });
  }

  // se verifica que el token sea valido y no haya expirado
  jwt.verify(token, process.env.JWT_SECRET, (err, datosDecodificados) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalido o expirado' });
    }

    // se guardan los datos del usuario en el request para usarlos en el controlador
    req.usuario = datosDecodificados;
    next();
  });
}

module.exports = verificarToken;