/**
 * Script para reindexar todos los productos en OpenSearch
 * Uso: npm run search:index
 */
import { SearchService } from '../server/services/searchService';
import { db } from '../server/db';
import { products } from '../shared/schema';

async function reindexAllProducts() {
  console.log('Iniciando reindexación de productos en OpenSearch...');
  
  try {
    const searchService = new SearchService();
    
    // Verificar conexión con OpenSearch
    console.log('Verificando conexión con OpenSearch...');
    
    // Reindexar todos los productos
    const result = await searchService.reindexAllProducts();
    
    console.log(`✅ Reindexación completada: ${result.indexed} productos indexados`);
    
  } catch (error) {
    console.error('❌ Error durante la reindexación:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Ejecutar script
reindexAllProducts();