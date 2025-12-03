/**
 * Motor RAG (Retrieval-Augmented Generation) ligero
 * 
 * Este módulo implementa búsqueda semántica simple usando embeddings
 * y similitud de coseno. Los contenidos reales se añadirán manualmente.
 * 
 * IMPORTANTE: Los archivos embeddings.json y documents.json están vacíos
 * y serán poblados manualmente con el corpus emocional.
 */

import embeddingsData from '../rag/embeddings.json';
import documentsData from '../rag/documents.json';

let embeddings = null;
let documents = null;

/**
 * Carga los embeddings y documentos desde los archivos JSON
 * 
 * @returns {Promise<void>}
 */
export async function loadEmbeddings() {
  try {
    // Los datos ya están importados estáticamente
    embeddings = embeddingsData || [];
    documents = documentsData || [];

    if (embeddings.length === 0 || documents.length === 0) {
      console.warn('RAG: Los archivos de embeddings o documentos están vacíos. El RAG funcionará en modo vacío.');
    } else {
      console.log(`RAG: Cargados ${embeddings.length} embeddings y ${documents.length} documentos.`);
    }
  } catch (error) {
    console.error('Error cargando embeddings:', error);
    embeddings = [];
    documents = [];
  }
}

/**
 * Calcula la similitud de coseno entre dos vectores
 * 
 * @param {Array<number>} a - Vector A
 * @param {Array<number>} b - Vector B
 * @returns {number} Similitud de coseno (0-1)
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * Convierte un texto en un embedding simple (TF-IDF básico o hash)
 * 
 * NOTA: En producción, esto debería usar un modelo de embeddings real
 * (por ejemplo, OpenAI embeddings, Sentence Transformers, etc.)
 * 
 * @param {string} text - Texto a convertir
 * @returns {Array<number>} Vector de embedding
 */
function textToEmbedding(text) {
  // Implementación simplificada: hash de palabras
  // En producción, usar un servicio de embeddings real
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = {};
  
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  // Crear un vector simple basado en frecuencias
  // Esto es solo para demostración - usar embeddings reales en producción
  const uniqueWords = Object.keys(wordFreq);
  const vector = new Array(128).fill(0);
  
  uniqueWords.forEach((word, idx) => {
    if (idx < vector.length) {
      vector[idx] = wordFreq[word] / words.length;
    }
  });

  return vector;
}

/**
 * Busca los chunks más relevantes para una consulta
 * 
 * @param {string} query - Consulta del usuario
 * @param {number} k - Número de chunks a retornar (default: 3)
 * @returns {Array<Object>} Array de chunks relevantes con texto y score
 */
export function searchRelevantChunks(query, k = 3) {
  // Si no hay embeddings cargados, retornar array vacío
  if (!embeddings || embeddings.length === 0 || !documents || documents.length === 0) {
    console.warn('RAG: No hay embeddings disponibles. Retornando array vacío.');
    return [];
  }

  // Convertir la consulta a embedding
  const queryEmbedding = textToEmbedding(query);

  // Calcular similitud con todos los embeddings
  const similarities = embeddings.map((embedding, index) => {
    const similarity = cosineSimilarity(queryEmbedding, embedding.vector || embedding);
    return {
      index,
      similarity,
      text: documents[index]?.text || documents[index] || '',
      metadata: documents[index]?.metadata || {}
    };
  });

  // Ordenar por similitud descendente
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Retornar los top k chunks
  return similarities.slice(0, k).filter(item => item.similarity > 0);
}

/**
 * Inicializa el motor RAG
 * Debe llamarse al inicio de la aplicación
 * 
 * @returns {Promise<void>}
 */
export async function initializeRAG() {
  await loadEmbeddings();
}

