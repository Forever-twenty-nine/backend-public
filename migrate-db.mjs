/**
 * Script para migrar datos de MongoDB local a Docker
 */
import mongoose from 'mongoose';

const LOCAL_URI = 'mongodb://localhost:27017/cursala';
const DOCKER_URI = 'mongodb://admin:changeme123@localhost:27018/cursala?authSource=admin';

async function migrateData() {
  console.log('🔄 Conectando a las bases de datos...');
  
  // Crear dos conexiones independientes
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  const dockerConn = await mongoose.createConnection(DOCKER_URI).asPromise();
  
  try {
    console.log('✅ Conexiones establecidas\n');
    
    // Obtener todas las colecciones
    const collections = await localConn.db.listCollections().toArray();
    console.log(`📋 Colecciones encontradas: ${collections.length}\n`);
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`📦 Migrando colección: ${collectionName}`);
      
      const sourceCollection = localConn.db.collection(collectionName);
      const targetCollection = dockerConn.db.collection(collectionName);
      
      // Obtener todos los documentos
      const documents = await sourceCollection.find({}).toArray();
      console.log(`   📄 Documentos encontrados: ${documents.length}`);
      
      if (documents.length > 0) {
        // Limpiar colección destino
        await targetCollection.deleteMany({});
        
        // Insertar documentos
        await targetCollection.insertMany(documents);
        console.log(`   ✅ ${documents.length} documentos migrados`);
      } else {
        console.log(`   ⚠️  Colección vacía, saltando...`);
      }
      console.log('');
    }
    
    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await localConn.close();
    await dockerConn.close();
  }
}

migrateData();
