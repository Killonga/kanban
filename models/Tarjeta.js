// models/Tarjeta.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tarjeta = sequelize.define('Tarjeta', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    prioridad: {
      type: DataTypes.ENUM('Feature', 'Task', 'Bug', 'Improvement'),
      defaultValue: 'Task',
    },
    tag: {
      type: DataTypes.ENUM('FEATURE', 'BUG', 'HOTFIX'),
      defaultValue: 'FEATURE',
    },
    estado: {
      type: DataTypes.ENUM('Backlog', 'Doing', 'Review', 'Done'),
      defaultValue: 'Backlog',
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY, // solo fecha, sin hora
      allowNull: true,
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    autor: {
      type: DataTypes.STRING(100),
      defaultValue: 'Anónimo',
    },
    responsable: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    // listaId se agrega automáticamente por la relación en index.js
  }, {
    tableName: 'tarjetas',
    timestamps: true,
  });

  return Tarjeta;
};
