import { generateEmbedding } from "./pdf";
import * as chunksRepo from "@/repositories/chunks";
import * as docsRepo from "@/repositories/documents";
import * as https from "https";
import { ChatSource, DocumentChunk } from "@/types";

/**
 * Low-level OpenAI chat completion using Node.js https to avoid
 * ERR_STREAM_PREMATURE_CLOSE caused by Next.js patching global fetch.
 */
function httpsChatCompletion(
  messages: { role: string; content: string }[],
  model: string,
  maxTokens: number,
  temperature: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      reject(new Error("OPENAI_API_KEY is not set"));
      return;
    }

    const bodyBuffer = Buffer.from(
      JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
      "utf-8",
    );

    const req = https.request(
      {
        hostname: "api.openai.com",
        port: 443,
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": bodyBuffer.length,
        },
        timeout: 120000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
            if (parsed.error) {
              reject(new Error(parsed.error.message));
            } else {
              resolve(parsed.choices[0].message.content || "");
            }
          } catch (e) {
            reject(e);
          }
        });
        res.on("error", reject);
      },
    );

    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("Request timed out")));
    req.write(bodyBuffer);
    req.end();
  });
}

/**
 * Search for relevant chunks based on a question
 */
export async function searchRelevantChunks(
  question: string,
  topK: number = 5,
): Promise<DocumentChunk[]> {
  try {
    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);

    // Search for similar chunks using pgvector
    const similarChunks = await chunksRepo.searchSimilarChunks(
      questionEmbedding,
      topK,
    );

    return similarChunks;
  } catch (error) {
    console.error("Error searching relevant chunks:", error);
    throw error;
  }
}

/**
 * Build context from relevant chunks
 */
export function buildContext(chunks: DocumentChunk[]): string {
  return chunks
    .map((chunk, index) => `[Reference ${index + 1}]\n${chunk.content}`)
    .join("\n\n");
}

/**
 * Generate answer using OpenAI with context
 */
export async function generateAnswer(
  question: string,
  context: string,
): Promise<string> {
  try {
    const systemPrompt = `You are a helpful AI assistant that answers questions based ONLY on the provided context. 
If the context does not contain information to answer the question, respond with: "I cannot find information related to that question in the uploaded documents."
Always be accurate and cite the reference numbers when relevant.`;

    const userPrompt = `Context:\n${context}\n\nQuestion: ${question}`;

    return await httpsChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      "gpt-4o-mini",
      1000,
      0.7,
    );
  } catch (error) {
    console.error("Error generating answer:", error);
    throw new Error("Failed to generate answer");
  }
}

/**
 * Extract sources from chunks
 */
export async function extractSources(
  chunks: DocumentChunk[],
): Promise<ChatSource[]> {
  try {
    const uniqueDocIds = [...new Set(chunks.map((c) => c.document_id))];

    const sources: ChatSource[] = [];

    for (const docId of uniqueDocIds) {
      const doc = await docsRepo.getDocumentById(docId);
      if (!doc) continue;

      // Get up to 2 chunks from this document
      const docChunks = chunks
        .filter((c) => c.document_id === docId)
        .slice(0, 2);

      for (const chunk of docChunks) {
        sources.push({
          document: doc.filename,
          excerpt:
            chunk.content.substring(0, 150) +
            (chunk.content.length > 150 ? "..." : ""),
        });
      }
    }

    return sources;
  } catch (error) {
    console.error("Error extracting sources:", error);
    throw error;
  }
}

/**
 * Full RAG pipeline: question -> answer + sources
 */
export async function answerQuestion(question: string): Promise<{
  answer: string;
  sources: ChatSource[];
  noDocumentsFound: boolean;
}> {
  try {
    // Search for relevant chunks
    const relevantChunks = await searchRelevantChunks(question, 5);

    // Check if relevant chunks were found
    if (relevantChunks.length === 0) {
      return {
        answer:
          "I cannot find information related to that question in the uploaded documents.",
        sources: [],
        noDocumentsFound: true,
      };
    }

    // Build context from chunks
    const context = buildContext(relevantChunks);

    // Generate answer
    const answer = await generateAnswer(question, context);

    // Extract sources
    const sources = await extractSources(relevantChunks);

    return {
      answer,
      sources,
      noDocumentsFound: false,
    };
  } catch (error) {
    console.error("Error in RAG pipeline:", error);
    throw error;
  }
}
