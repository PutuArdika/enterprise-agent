import { query } from "@/lib/db";
import { DocumentChunk } from "@/types";

export async function createChunk(
  documentId: string,
  content: string,
  chunkIndex: number,
  embedding: number[],
): Promise<DocumentChunk> {
  const embeddingJson = JSON.stringify(embedding);

  const result = await query(
    `INSERT INTO document_chunks (document_id, content, chunk_index, embedding) 
     VALUES ($1, $2, $3, $4::jsonb) 
     RETURNING id, document_id, content, chunk_index, created_at, updated_at`,
    [documentId, content, chunkIndex, embeddingJson],
  );

  return result.rows[0];
}

export async function getChunksByDocumentId(
  documentId: string,
): Promise<DocumentChunk[]> {
  const result = await query(
    `SELECT id, document_id, content, chunk_index, created_at, updated_at 
     FROM document_chunks 
     WHERE document_id = $1 
     ORDER BY chunk_index ASC`,
    [documentId],
  );

  return result.rows;
}

export async function searchSimilarChunks(
  embedding: number[],
  limit: number = 5,
): Promise<DocumentChunk[]> {
  // Fetch all chunks (since we're doing similarity in JS)
  const result = await query(
    `SELECT 
      id, 
      document_id, 
      content, 
      chunk_index, 
      embedding,
      created_at, 
      updated_at
     FROM document_chunks 
     ORDER BY chunk_index ASC`,
    [],
  );

  // Compute cosine similarity in JavaScript
  const cosineSimilarity = (a: number[], b: number[]): number => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (normA * normB);
  };

  // Calculate similarity for each chunk
  const chunksWithSimilarity = result.rows
    .map((chunk: any) => {
      // Handle both string and object embeddings
      let chunkEmbedding: number[];
      if (typeof chunk.embedding === "string") {
        try {
          chunkEmbedding = JSON.parse(chunk.embedding);
        } catch (e) {
          console.error("Failed to parse embedding:", chunk.embedding);
          chunkEmbedding = [];
        }
      } else if (Array.isArray(chunk.embedding)) {
        chunkEmbedding = chunk.embedding;
      } else {
        console.error("Invalid embedding format:", typeof chunk.embedding);
        chunkEmbedding = [];
      }

      const similarity =
        chunkEmbedding.length > 0
          ? cosineSimilarity(embedding, chunkEmbedding)
          : 0;

      return { ...chunk, similarity };
    })
    .sort((a: any, b: any) => b.similarity - a.similarity)
    .slice(0, limit);

  return chunksWithSimilarity;
}

export async function getChunkCount(): Promise<number> {
  const result = await query("SELECT COUNT(*) as count FROM document_chunks");
  return parseInt(result.rows[0].count, 10);
}

export async function deleteChunksByDocumentId(
  documentId: string,
): Promise<void> {
  await query("DELETE FROM document_chunks WHERE document_id = $1", [
    documentId,
  ]);
}
