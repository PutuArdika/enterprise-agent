import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT id, question, answer, sources, asked_at
       FROM chat_history
       ORDER BY asked_at DESC
       LIMIT 100`,
    );

    return Response.json({
      success: true,
      messages: result.rows,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return Response.json(
      { success: false, error: "Failed to fetch chat history" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { question, answer, sources } = await req.json();

    if (!question || !answer) {
      return Response.json(
        { success: false, error: "Question and answer are required" },
        { status: 400 },
      );
    }

    const result = await query(
      `INSERT INTO chat_history (question, answer, sources)
       VALUES ($1, $2, $3)
       RETURNING id, question, answer, sources, asked_at`,
      [question, answer, JSON.stringify(sources || [])],
    );

    return Response.json({
      success: true,
      message: result.rows[0],
    });
  } catch (error) {
    console.error("Error saving chat history:", error);
    return Response.json(
      { success: false, error: "Failed to save chat history" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await query(`DELETE FROM chat_history`);

    return Response.json({
      success: true,
      message: "Chat history cleared",
    });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return Response.json(
      { success: false, error: "Failed to clear chat history" },
      { status: 500 },
    );
  }
}
