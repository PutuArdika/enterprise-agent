import { NextRequest, NextResponse } from "next/server";
import { openaiChatCompletion } from "@/lib/openai";
import * as pdfjsLib from "pdfjs-dist";

// Set up the worker for pdfjs - same as in services/pdf.ts
if (typeof window === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfjsWorker = require("pdfjs-dist/build/pdf.worker");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

interface CVAnalysis {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: string[];
  education: string[];
  summary: string;
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
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
async function analyzeWithOpenAI(text: string): Promise<CVAnalysis> {
  try {
    const prompt = `Analyze this CV/Resume text and extract the following information in JSON format:
{
  "name": "extracted name or null",
  "email": "extracted email or null",
  "phone": "extracted phone or null",
  "skills": ["skill1", "skill2", ...],
  "experience": ["job title at company (duration) - brief description", ...],
  "education": ["degree from university (year) or institution details", ...],
  "summary": "professional summary or objective from the CV, 2-3 sentences"
}

Rules:
- Extract exactly as shown in the CV
- For skills, list technical and soft skills separately
- For experience, include job titles, companies, and brief descriptions
- For education, include degrees, institutions, and graduation years
- Keep summary concise and professional
- Return only valid JSON, no markdown formatting

CV Text:
${text}`;

    const content = await openaiChatCompletion({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a CV/Resume analyzer. Extract structured information from CVs and return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    if (!content) {
      throw new Error("No response from AI");
    }

    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    const parsed = JSON.parse(jsonStr);

    return {
      name: parsed.name || undefined,
      email: parsed.email || undefined,
      phone: parsed.phone || undefined,
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      summary: parsed.summary || "",
    };
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    throw new Error("Failed to analyze CV with AI");
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Only PDF files are supported" },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);

    // Extract text from PDF
    const text = await extractTextFromPDF(pdfBuffer);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Could not extract text from PDF" },
        { status: 400 },
      );
    }

    // Analyze with OpenAI
    const analysis = await analyzeWithOpenAI(text);

    return NextResponse.json({
      success: true,
      ...analysis,
    });
  } catch (error) {
    console.error("CV analyzer error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze CV";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
