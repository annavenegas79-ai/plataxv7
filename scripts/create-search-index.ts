/**
 * Script para crear el índice de búsqueda en OpenSearch
 * Uso: npm run search:create-index
 */
import { Client } from '@opensearch-project/opensearch';

async function createSearchIndex() {
  console.log('Creando índice de búsqueda en OpenSearch...');
  
  try {
    const indexName = 'platamx_products';
    
    // Inicializar cliente OpenSearch
    const client = new Client({
      node: process.env.OPENSEARCH_URL || 'https://opensearch.platamx.com',
      auth: {
        username: process.env.OPENSEARCH_USERNAME || 'admin',
        password: process.env.OPENSEARCH_PASSWORD || 'admin'
      },
      ssl: {
        rejectUnauthorized: false // Solo para desarrollo
      }
    });
    
    // Verificar si el índice ya existe
    const indexExists = await client.indices.exists({
      index: indexName
    });
    
    if (indexExists.body) {
      console.log(`El índice ${indexName} ya existe. ¿Desea eliminarlo y recrearlo? (S/N)`);
      process.stdin.once('data', async (data) => {
        const input = data.toString().trim().toLowerCase();
        
        if (input === 's' || input === 'y' || input === 'yes' || input === 'si') {
          console.log(`Eliminando índice ${indexName}...`);
          await client.indices.delete({
            index: indexName
          });
          await createIndex(client, indexName);
        } else {
          console.log('Operación cancelada.');
          process.exit(0);
        }
      });
    } else {
      await createIndex(client, indexName);
    }
    
  } catch (error) {
    console.error('❌ Error creando índice:', error);
    process.exit(1);
  }
}

async function createIndex(client: Client, indexName: string) {
  try {
    await client.indices.create({
      index: indexName,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
          analysis: {
            filter: {
              spanish_stop: {
                type: "stop",
                stopwords: "_spanish_"
              },
              spanish_stemmer: {
                type: "stemmer",
                language: "spanish"
              },
              spanish_synonym_filter: {
                type: "synonym",
                synonyms: [
                  "plata 925, plata sterling, silver 925, plata de ley, sterling silver",
                  "plata 950, plata fina, silver 950, plata britania",
                  "aretes, arracadas, pendientes, zarcillos, earrings",
                  "martillado, textura martillada, hammered, texturizado",
                  "oxidado, patinado, antique, envejecido, blackened",
                  "taxco, Taxco de Alarcón, Guerrero, capital mundial de la plata"
                ]
              }
            },
            analyzer: {
              spanish_analyzer: {
                type: "custom",
                tokenizer: "standard",
                filter: [
                  "lowercase",
                  "spanish_stop",
                  "spanish_stemmer"
                ]
              },
              spanish_synonym_analyzer: {
                tokenizer: "standard",
                filter: [
                  "lowercase",
                  "spanish_synonym_filter",
                  "spanish_stemmer"
                ]
              }
            }
          }
        },
        mappings: {
          properties: {
            productId: { type: "integer" },
            title: { 
              type: "text",
              analyzer: "spanish_synonym_analyzer",
              fields: {
                keyword: { type: "keyword" }
              }
            },
            description: { 
              type: "text",
              analyzer: "spanish_analyzer" 
            },
            searchVector: { 
              type: "text",
              analyzer: "spanish_synonym_analyzer" 
            },
            facets: { 
              type: "object",
              properties: {
                material: { 
                  type: "text",
                  fields: {
                    keyword: { type: "keyword" }
                  }
                },
                technique: { type: "text" },
                origin: { type: "text" }
              }
            },
            gramaje: { type: "float" },
            tallasAnillos: { 
              type: "text",
              fields: {
                keyword: { type: "keyword" }
              }
            },
            tecnicas: { 
              type: "text",
              fields: {
                keyword: { type: "keyword" }
              }
            },
            origen: { 
              type: "text",
              fields: {
                keyword: { type: "keyword" }
              }
            },
            price: { type: "float" },
            lastIndexed: { type: "date" }
          }
        }
      }
    });
    
    console.log(`✅ Índice ${indexName} creado exitosamente`);
    console.log('Para indexar productos, ejecute: npm run search:index');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creando índice:', error);
    process.exit(1);
  }
}

// Ejecutar script
createSearchIndex();