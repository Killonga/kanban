// models/Tablero.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tablero = sequelize.define('Tablero', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    // usuarioId se agrega automáticamente por la relación en index.js
  }, {
    tableName: 'tableros',
    timestamps: true,
  });

  return Tablero;
};
