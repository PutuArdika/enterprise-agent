import { NextResponse } from "next/server";
import * as docsRepo from "@/repositories/documents";
import * as chunksRepo from "@/repositories/chunks";
import * as chatHistoryRepo from "@/repositories/chat-history";
import { StatsResponse } from "@/types";

export async function GET(): Promise<NextResponse<StatsResponse>> {
  try {
    // Get statistics
    const [totalDocuments, totalChunks, recentDocuments, totalQuestions] =
      await Promise.all([
        docsRepo.getDocumentCount(),
        chunksRepo.getChunkCount(),
        docsRepo.getRecentDocuments(5),
        chatHistoryRepo.getChatHistoryCount(),
      ]);

    return NextResponse.json({
      totalDocuments,
      totalChunks,
      totalQuestions,
      recentDocuments,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      {
        totalDocuments: 0,
        totalChunks: 0,
        totalQuestions: 0,
        recentDocuments: [],
      },
      { status: 500 },
    );
  }
}
