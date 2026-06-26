import * as pdfjsLib from "pdfjs-dist";
import * as https from "https";

// Set up the worker for pdfjs - use CDN version to avoid canvas issues
if (typeof window === "undefined") {
  const pdfjsWorker = require("pdfjs-dist/build/pdf.worker");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || "1000", 10);
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || "200", 10);
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Convert Buffer to Uint8Array for pdfjs-dist
    const uint8Array = new Uint8Array(buffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => (item.str ? item.str : ""))
        .join(" ");
      fullText += pageText + " ";
    }

    return fullText.trim();
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Split text into overlapping chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP,
): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);

  let currentChunk: string[] = [];
  let currentSize = 0;

  for (const word of words) {
    currentChunk.push(word);
    currentSize += word.length + 1; // +1 for space

    if (currentSize >= chunkSize) {
      const chunk = currentChunk.join(" ");
      chunks.push(chunk);

      // Keep overlap for next chunk
      const overlapWords = Math.ceil(
        (overlap / chunkSize) * currentChunk.length,
      );
      currentChunk = currentChunk.slice(-overlapWords);
      currentSize = currentChunk.join(" ").length;
    }
  }

  // Add remaining chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * Low-level OpenAI embeddings request using Node.js https module.
 * Bypasses the OpenAI SDK's fetch entirely to avoid ERR_STREAM_PREMATURE_CLOSE
 * caused by Next.js patching the global fetch API.
 */
function httpsEmbeddingRequest(
  texts: string[],
  model: string,
): Promise<number[][]> {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      reject(new Error("OPENAI_API_KEY is not set"));
      return;
    }

    const bodyBuffer = Buffer.from(
      JSON.stringify({ model, input: texts }),
      "utf-8",
    );

    const req = https.request(
      {
        hostname: "api.openai.com",
        port: 443,
        path: "/v1/embeddings",
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
              resolve(
                parsed.data.map(
                  (item: { embedding: number[] }) => item.embedding,
                ),
              );
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
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const results = await httpsEmbeddingRequest([text], EMBEDDING_MODEL);
  return results[0];
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddingsBatch(
  texts: string[],
): Promise<number[][]> {
  const batchSize = 20;
  const embeddings: number[][] = [];
  const maxRetries = 3;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await httpsEmbeddingRequest(batch, EMBEDDING_MODEL);
        embeddings.push(...result);
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const delay = attempt * 2000;
          console.warn(
            `Embedding batch attempt ${attempt} failed, retrying in ${delay}ms...`,
            error,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (lastError) {
      console.error("Error generating embeddings batch:", lastError);
      throw new Error("Failed to generate embeddings");
    }
  }

  return embeddings;
}

/**
 * Process PDF file and return chunks with embeddings
 */
export async function processPDFFile(
  buffer: Buffer,
): Promise<Array<{ content: string; embedding: number[] }>> {
  try {
    // Extract text from PDF
    const text = await extractTextFromPDF(buffer);

    // Split into chunks
    const chunks = chunkText(text);

    // Generate embeddings for all chunks
    const embeddings = await generateEmbeddingsBatch(chunks);

    // Combine chunks with embeddings
    return chunks.map((content, index) => ({
      content,
      embedding: embeddings[index],
    }));
  } catch (error) {
    console.error("Error processing PDF file:", error);
    throw error;
  }
}
