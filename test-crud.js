// test-crud.js
// Verifica las 4 operaciones CRUD sobre la base de datos de forma aislada.
// Requiere haber ejecutado seed.js primero.
// Uso: node test-crud.js
 
const { sequelize, Tablero, Lista, Tarjeta } = require('./models');
 
async function testCrud() {
  try {
    await sequelize.authenticate();
    console.log('Conexion a PostgreSQL establecida.\n');
    console.log('-------------------------------------------');
 
    // CREATE
    console.log('\n[CREATE] Creando nueva tarjeta...');
 
    const lista = await Lista.findOne({ where: { estado: 'Backlog' } });
    if (!lista) throw new Error('No se encontro ninguna lista. Ejecuta seed.js primero.');
 
    const nuevaTarjeta = await Tarjeta.create({
      titulo:       'Tarjeta creada por test-crud',
      descripcion:  'Verificando operacion CREATE',
      prioridad:    'Bug',
      tag:          'BUG',
      estado:       'Backlog',
      fecha_inicio: '2026-03-16',
      fecha_fin:    '2026-03-20',
      autor:        'Test Script',
      responsable:  'QA',
      listaId:      lista.id,
    });
 
    console.log(`   Tarjeta creada con ID: ${nuevaTarjeta.id}`);
    console.log(`   Titulo: "${nuevaTarjeta.titulo}" -> Lista: ${lista.nombre}`);
 
    // READ
    console.log('\n[READ] Leyendo un tablero con sus listas y tarjetas...');
 
    const tablero = await Tablero.findOne({
      include: [
        {
          model: Lista,
          as: 'listas',
          include: [
            { model: Tarjeta, as: 'tarjetas' }
          ]
        }
      ]
    });
 
    console.log(`   Tablero: "${tablero.nombre}"`);
    for (const l of tablero.listas) {
      console.log(`   Lista: ${l.nombre} (${l.tarjetas.length} tarjeta/s)`);
      for (const t of l.tarjetas) {
        console.log(`      [${t.prioridad}] ${t.titulo}`);
      }
    }
 
    // UPDATE
    console.log('\n[UPDATE] Modificando el titulo de la tarjeta creada...');
 
    const tituloOriginal = nuevaTarjeta.titulo;
    await nuevaTarjeta.update({ titulo: 'Tarjeta ACTUALIZADA por test-crud' });
 
    const tarjetaActualizada = await Tarjeta.findByPk(nuevaTarjeta.id);
    console.log(`   Titulo anterior: "${tituloOriginal}"`);
    console.log(`   Titulo nuevo:    "${tarjetaActualizada.titulo}"`);
 
    // DELETE
    console.log('\n[DELETE] Eliminando la tarjeta de prueba...');
 
    const idEliminado = tarjetaActualizada.id;
    await tarjetaActualizada.destroy();
 
    const verificacion = await Tarjeta.findByPk(idEliminado);
    if (verificacion === null) {
      console.log(`   Tarjeta con ID ${idEliminado} eliminada correctamente.`);
    }
 
    console.log('\n-------------------------------------------');
    console.log('Todas las operaciones CRUD completadas con exito.\n');
 
  } catch (error) {
    console.error('Error en test-crud:', error.message);
  } finally {
    await sequelize.close();
  }
}
 
testCrud();