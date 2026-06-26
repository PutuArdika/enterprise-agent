import { NextRequest, NextResponse } from "next/server";
import { processPDFFile } from "@/services/pdf";
import * as docsRepo from "@/repositories/documents";
import * as chunksRepo from "@/repositories/chunks";
import { UploadResponse } from "@/types";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<UploadResponse>> {
  try {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are supported" },
        { status: 400 },
      );
    }

    // Validate file size (max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 50MB limit" },
        { status: 400 },
      );
    }

    console.log(`Uploading file: ${file.name}, size: ${file.size}`);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process PDF and generate embeddings
    const chunksWithEmbeddings = await processPDFFile(buffer);

    if (chunksWithEmbeddings.length === 0) {
      return NextResponse.json(
        { success: false, error: "No content extracted from PDF" },
        { status: 400 },
      );
    }

    // Create document in database
    const document = await docsRepo.createDocument(file.name, file.size);

    // Save chunks with embeddings
    for (let i = 0; i < chunksWithEmbeddings.length; i++) {
      const { content, embedding } = chunksWithEmbeddings[i];
      await chunksRepo.createChunk(document.id, content, i, embedding);
    }

    console.log(
      `Successfully uploaded document: ${document.id} with ${chunksWithEmbeddings.length} chunks`,
    );

    return NextResponse.json({
      success: true,
      document,
      message: `Document uploaded successfully with ${chunksWithEmbeddings.length} chunks`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process upload" },
      { status: 500 },
    );
  }
}
