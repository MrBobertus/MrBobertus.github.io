// compare.js

/**
 * Calculates the dot product of two vectors. Internal helper function.
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} Dot product
 * @throws {Error} if vectors are invalid or lengths mismatch
 */
function dotProduct(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    throw new Error(
      "Vectors must exist and have the same length for dot product."
    );
  }
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    if (typeof vecA[i] !== "number" || typeof vecB[i] !== "number") {
      throw new Error(
        `Vectors must contain only numbers. Found ${typeof vecA[
          i
        ]} and ${typeof vecB[i]} at index ${i}.`
      );
    }
    product += vecA[i] * vecB[i];
  }
  return product;
}

/**
 * Calculates the magnitude (Euclidean norm) of a vector. Internal helper function.
 * @param {number[]} vec
 * @returns {number} Magnitude
 * @throws {Error} if vector is invalid or contains non-numeric values
 */
function magnitude(vec) {
  if (!vec) {
    throw new Error("Cannot calculate magnitude of an invalid vector.");
  }
  let sumOfSquares = 0;
  for (let i = 0; i < vec.length; i++) {
    if (typeof vec[i] !== "number") {
      throw new Error(
        `Vector must contain only numbers. Found ${typeof vec[
          i
        ]} at index ${i}.`
      );
    }
    sumOfSquares += vec[i] * vec[i];
  }
  return Math.sqrt(sumOfSquares);
}

/**
 * Calculates the cosine similarity between two vectors.
 * Exported for potential direct use.
 * @param {number[]} vecA - The first vector.
 * @param {number[]} vecB - The second vector.
 * @returns {number} The cosine similarity (between -1 and 1). Returns 0 on error or zero magnitude.
 */
export function cosineSimilarity(vecA, vecB) {
  if (
    !Array.isArray(vecA) ||
    !Array.isArray(vecB) ||
    vecA.length === 0 ||
    vecB.length === 0
  ) {
    return 0;
  }

  try {
    const magA = magnitude(vecA);
    const magB = magnitude(vecB);

    if (magA === 0 || magB === 0) {
      return 0;
    }

    const dot = dotProduct(vecA, vecB);
    const similarity = dot / (magA * magB);

    return Math.max(-1, Math.min(1, similarity));
  } catch (error) {
    return 0;
  }
}

/**
 * Compares a single query embedding object against context embedding objects.
 * This is the primary function for RAG retrieval. Exported.
 *
 * @param {{embedding: number[]}} queryEmbeddingObject - Object containing the query embedding. e.g. { text: "optional", embedding: [...] }
 * @param {Array<{text: string, embedding: number[]}>} contextData - Array of context chunks and their embeddings.
 * @param {object} [options] - Optional search parameters.
 * @param {number} [options.topN=3] - The number of top relevant contexts to return (alias topK).
 * @param {number} [options.topK=3] - The number of top relevant contexts to return.
 * @param {number} [options.minSimilarity=0.0] - The minimum similarity score for a context to be included.
 * @returns {Array<{text: string, similarity: number}>} An array of the top N most relevant context objects, filtered by minSimilarity, sorted descending.
 */
export function compareData(queryEmbeddingObject, contextData, options = {}) {
  // --- Input Validation & Option Handling ---
  if (
    !queryEmbeddingObject ||
    !queryEmbeddingObject.embedding ||
    !Array.isArray(queryEmbeddingObject.embedding) ||
    queryEmbeddingObject.embedding.length === 0
  ) {
    return [];
  }
  if (!Array.isArray(contextData)) {
    return [];
  }
  if (contextData.length === 0) {
    return [];
  }

  const topK =
    typeof options.topK === "number" && options.topK > 0
      ? options.topK
      : typeof options.topN === "number" && options.topN > 0
      ? options.topN
      : 3;
  const minSimilarity =
    typeof options.minSimilarity === "number"
      ? Math.max(-1, Math.min(1, options.minSimilarity))
      : 0.0;

  // --- Get Query Embedding ---
  const queryEmbedding = queryEmbeddingObject.embedding;

  // --- Calculate Similarities & Filter ---
  const similarityResults = [];
  for (let i = 0; i < contextData.length; i++) {
    const contextItem = contextData[i];

    if (
      contextItem &&
      typeof contextItem.text === "string" &&
      Array.isArray(contextItem.embedding) &&
      contextItem.embedding.length > 0 // Also check context embedding validity
    ) {
      // Pass the raw embedding arrays to cosineSimilarity
      const similarity = cosineSimilarity(
        queryEmbedding,
        contextItem.embedding
      );

      if (similarity >= minSimilarity) {
        similarityResults.push({
          text: contextItem.text, //Text
          similarity: similarity, //Similarity
          filename: contextItem.filename, //Filename
        });
      }
    }
  }

  // --- Sort by Similarity (Descending) ---
  similarityResults.sort((a, b) => b.similarity - a.similarity);

  // --- Return Top K Results ---
  return similarityResults.slice(0, topK);
}
