// models/index.js
// Importa la conexion, activa los modelos y define las relaciones.
 
const sequelize = require('../config/database');
 
// Importar modelos
const Usuario = require('./Usuario')(sequelize);
const Tablero = require('./Tablero')(sequelize);
const Lista   = require('./Lista')(sequelize);
const Tarjeta = require('./Tarjeta')(sequelize);
 
// Relaciones (uno a muchos)
// Un Usuario tiene muchos Tableros
Usuario.hasMany(Tablero, { foreignKey: 'usuarioId', as: 'tableros' });
Tablero.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
 
// Un Tablero tiene muchas Listas
Tablero.hasMany(Lista, { foreignKey: 'tableroId', as: 'listas' });
Lista.belongsTo(Tablero, { foreignKey: 'tableroId', as: 'tablero' });
 
// Una Lista tiene muchas Tarjetas
Lista.hasMany(Tarjeta, { foreignKey: 'listaId', as: 'tarjetas' });
Tarjeta.belongsTo(Lista, { foreignKey: 'listaId', as: 'lista' });
 
module.exports = { sequelize, Usuario, Tablero, Lista, Tarjeta };
 