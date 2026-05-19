// seed.js
// Crea las tablas (si no existen) y las puebla con datos de prueba.
// Uso: node seed.js
 
const { sequelize, Usuario, Tablero, Lista, Tarjeta } = require('./models');
 
async function seed() {
  try {
    // 1. Sincronizar modelos -> crea las tablas en PostgreSQL
    //    force: true borra y recrea las tablas (util en desarrollo)
    await sequelize.sync({ force: true });
    console.log('Base de datos reiniciada para la Galería.\n');
 
    // 1. Crear Galería principal
    const galeria = await Tablero.create({
      nombre: 'Exposición: Renacimiento y Modernismo',
      descripcion: 'Una colección curada de obras maestras.',
      usuarioId: null // Opcional ahora
    ]);
 
    // 2. Crear Secciones (Muros)
    const [sala1, sala2] = await Lista.bulkCreate([
      { nombre: 'Obras Maestras', estado: 'Backlog', tableroId: galeria.id },
      { nombre: 'En Restauración',   estado: 'Doing',   tableroId: galeria.id },
      { nombre: 'Nuevas Adquisiciones',  estado: 'Review',  tableroId: galeria.id },
    ]);
 
    // 3. Crear Cuadros (Tarjetas con marcos)
    await Tarjeta.bulkCreate([
      {
        titulo: 'La Noche Estrellada',
        descripcion: 'Óleo sobre lienzo de Vincent van Gogh.',
        prioridad: 'Feature', tag: 'FEATURE', estado: 'Backlog',
        autor: 'Vincent van Gogh', responsable: 'Curador A',
        listaId: sala1.id,
      },
      {
        titulo: 'El Grito',
        descripcion: 'Expresionismo puro de Edvard Munch.',
        prioridad: 'Task', tag: 'HOTFIX', estado: 'Doing',
        autor: 'Edvard Munch', responsable: 'Restaurador B',
        listaId: sala2.id,
      },
    ]);
    console.log('Cuadros añadidos a la galería.');
  } catch (error) {
    console.error('Error en seed:', error.message);
  } finally {
    await sequelize.close();
  }
}
 
seed();