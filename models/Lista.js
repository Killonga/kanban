// models/Lista.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lista = sequelize.define('Lista', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('Backlog', 'Doing', 'Review', 'Done'),
      allowNull: false,
      defaultValue: 'Backlog',
    },
    // tableroId se agrega automáticamente por la relación en index.js
  }, {
    tableName: 'listas',
    timestamps: true,
  });

  return Lista;
};
