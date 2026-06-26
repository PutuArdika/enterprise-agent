import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/services/rag";
import { ChatResponse, ChatRequest } from "@/types";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ChatResponse>> {
  try {
    const body: ChatRequest = await req.json();

    if (!body.question || typeof body.question !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid question provided" },
        { status: 400 },
      );
    }

    const question = body.question.trim();

    if (question.length === 0) {
      return NextResponse.json(
        { success: false, error: "Question cannot be empty" },
        { status: 400 },
      );
    }

    console.log(`Processing question: ${question}`);

    // Generate answer using RAG pipeline
    const { answer, sources, noDocumentsFound } =
      await answerQuestion(question);

    return NextResponse.json({
      success: true,
      answer,
      sources,
      noDocumentsFound,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process question" },
      { status: 500 },
    );
  }
}
