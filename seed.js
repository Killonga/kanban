// seed.js
// Crea las tablas (si no existen) y las puebla con datos de prueba.
// Uso: node seed.js
 
const { sequelize, Usuario, Tablero, Lista, Tarjeta } = require('./models');
 
async function seed() {
  try {
    // 1. Sincronizar modelos -> crea las tablas en PostgreSQL
    //    force: true borra y recrea las tablas (util en desarrollo)
    await sequelize.sync({ force: true });
    console.log('Tablas creadas exitosamente.\n');
 
    // 2. Crear usuarios
    const [cristian, ana] = await Usuario.bulkCreate([
      { nombre: 'Cristian', email: 'cristian@kanbanpro.com', password: '123456' },
      { nombre: 'Ana Lopez', email: 'ana@kanbanpro.com',     password: 'abcdef' },
    ]);
    console.log(`Usuarios creados: ${cristian.nombre}, ${ana.nombre}`);
 
    // 3. Crear tableros
    const [sprintUno, sprintDos, marketing] = await Tablero.bulkCreate([
      { nombre: 'KanbanPro - Sprint 1', descripcion: 'Prototipo visual aprobado',     usuarioId: cristian.id },
      { nombre: 'KanbanPro - Sprint 2', descripcion: 'Arquitectura de base de datos', usuarioId: cristian.id },
      { nombre: 'Campana Marketing Q2', descripcion: 'Lanzamiento del producto',      usuarioId: ana.id },
    ]);
    console.log(`Tableros creados: ${sprintUno.nombre}, ${sprintDos.nombre}, ${marketing.nombre}`);
 
    // 4. Crear listas para Sprint 2
    const [backlog, doing, review, done] = await Lista.bulkCreate([
      { nombre: 'Backlog', estado: 'Backlog', tableroId: sprintDos.id },
      { nombre: 'Doing',   estado: 'Doing',   tableroId: sprintDos.id },
      { nombre: 'Review',  estado: 'Review',  tableroId: sprintDos.id },
      { nombre: 'Done',    estado: 'Done',    tableroId: sprintDos.id },
    ]);
    console.log(`Listas creadas para "${sprintDos.nombre}"`);
 
    // Listas para campana de marketing
    const [mktBacklog] = await Lista.bulkCreate([
      { nombre: 'Backlog',  estado: 'Backlog', tableroId: marketing.id },
      { nombre: 'En curso', estado: 'Doing',   tableroId: marketing.id },
    ]);
    console.log(`Listas creadas para "${marketing.nombre}"`);
 
    // 5. Crear tarjetas
    await Tarjeta.bulkCreate([
      // Sprint 2 - Backlog
      {
        titulo: 'Definir modelos Sequelize',
        descripcion: 'Crear Usuario, Tablero, Lista y Tarjeta con sus relaciones',
        prioridad: 'Feature', tag: 'FEATURE', estado: 'Backlog',
        fecha_inicio: '2026-03-01', fecha_fin: '2026-03-05',
        autor: 'Cristian', responsable: 'Cristian',
        listaId: backlog.id,
      },
      {
        titulo: 'Escribir seed.js',
        descripcion: 'Script para poblar la BD con datos de prueba',
        prioridad: 'Task', tag: 'FEATURE', estado: 'Backlog',
        fecha_inicio: '2026-03-05', fecha_fin: '2026-03-06',
        autor: 'Cristian', responsable: 'Cristian',
        listaId: backlog.id,
      },
      // Sprint 2 - Doing
      {
        titulo: 'Configurar conexion PostgreSQL',
        descripcion: 'Instalar pg, pg-hstore y configurar Sequelize',
        prioridad: 'Improvement', tag: 'FEATURE', estado: 'Doing',
        fecha_inicio: '2026-03-01', fecha_fin: '2026-03-03',
        autor: 'Cristian', responsable: 'Ana Lopez',
        listaId: doing.id,
      },
      // Sprint 2 - Review
      {
        titulo: 'Revisar diagrama ER',
        descripcion: 'Validar relaciones entre entidades',
        prioridad: 'Task', tag: 'HOTFIX', estado: 'Review',
        fecha_inicio: '2026-02-28', fecha_fin: '2026-03-02',
        autor: 'Ana Lopez', responsable: 'Cristian',
        listaId: review.id,
      },
      // Sprint 2 - Done
      {
        titulo: 'Aprobar diseno del Sprint 1',
        descripcion: 'Los stakeholders aprobaron el prototipo visual',
        prioridad: 'Task', tag: 'FEATURE', estado: 'Done',
        fecha_inicio: '2026-02-20', fecha_fin: '2026-02-23',
        autor: 'Cristian', responsable: 'Cristian',
        listaId: done.id,
      },
      // Marketing
      {
        titulo: 'Disenar banner de lanzamiento',
        descripcion: 'Banner para redes sociales',
        prioridad: 'Feature', tag: 'FEATURE', estado: 'Backlog',
        autor: 'Ana Lopez', responsable: 'Ana Lopez',
        listaId: mktBacklog.id,
      },
    ]);
    console.log('Tarjetas creadas.\n');
 
    console.log('Base de datos poblada exitosamente.');
  } catch (error) {
    console.error('Error en seed:', error.message);
  } finally {
    await sequelize.close();
  }
}
 
seed();