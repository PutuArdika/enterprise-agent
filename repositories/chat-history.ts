import { query } from "@/lib/db";

export async function getChatHistoryCount(): Promise<number> {
  try {
    const result = await query("SELECT COUNT(*) as count FROM chat_history");
    return parseInt(result.rows[0]?.count || "0", 10);
  } catch (error) {
    console.error("Error fetching chat history count:", error);
    return 0;
  }
}

export async function getAllChatHistory() {
  try {
    const result = await query(
      `SELECT id, question, answer, sources, asked_at
       FROM chat_history
       ORDER BY asked_at DESC`,
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching all chat history:", error);
    return [];
  }
}

export async function getChatHistoryByLimit(limit: number = 100) {
  try {
    const result = await query(
      `SELECT id, question, answer, sources, asked_at
       FROM chat_history
       ORDER BY asked_at DESC
       LIMIT $1`,
      [limit],
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching chat history with limit:", error);
    return [];
  }
}

export async function createChatHistory(
  question: string,
  answer: string,
  sources: any,
) {
  try {
    const result = await query(
      `INSERT INTO chat_history (question, answer, sources)
       VALUES ($1, $2, $3)
       RETURNING id, question, answer, sources, asked_at`,
      [question, answer, JSON.stringify(sources || [])],
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error creating chat history:", error);
    throw error;
  }
}

export async function deleteChatHistory() {
  try {
    await query("DELETE FROM chat_history");
    return true;
  } catch (error) {
    console.error("Error deleting chat history:", error);
    throw error;
  }
}
