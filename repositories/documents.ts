import { query } from "@/lib/db";
import { Document } from "@/types";

export async function createDocument(
  filename: string,
  fileSize: number,
): Promise<Document> {
  const result = await query(
    `INSERT INTO documents (filename, file_size) 
     VALUES ($1, $2) 
     RETURNING *`,
    [filename, fileSize],
  );

  return result.rows[0];
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const result = await query("SELECT * FROM documents WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function getAllDocuments(): Promise<Document[]> {
  const result = await query(
    `SELECT * FROM documents ORDER BY uploaded_at DESC`,
  );
  return result.rows;
}

export async function getRecentDocuments(
  limit: number = 5,
): Promise<Document[]> {
  const result = await query(
    `SELECT * FROM documents ORDER BY uploaded_at DESC LIMIT $1`,
    [limit],
  );
  return result.rows;
}

export async function getDocumentCount(): Promise<number> {
  const result = await query("SELECT COUNT(*) as count FROM documents");
  return parseInt(result.rows[0].count, 10);
}

export async function deleteDocument(id: string): Promise<void> {
  await query("DELETE FROM documents WHERE id = $1", [id]);
}
