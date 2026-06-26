import { NextRequest, NextResponse } from "next/server";
import { openaiChatCompletion } from "@/lib/openai";
import * as pdfjsLib from "pdfjs-dist";

// Set up the worker for pdfjs
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

interface EmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate: string;
  payload: {
    partId: string;
    mimeType: string;
    filename?: string;
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{
      partId: string;
      mimeType: string;
      filename?: string;
      headers: Array<{ name: string; value: string }>;
      body: { attachmentId: string };
    }>;
    body: { data?: string; attachmentId?: string };
  };
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
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
  "summary": "brief professional summary (2-3 sentences)"
}`;

    const content = await openaiChatCompletion({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nCV Text:\n${text}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    if (!content) throw new Error("No response from OpenAI");

    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing CV with OpenAI:", error);
    throw new Error("Failed to analyze CV");
  }
}

async function searchGmailMessages(
  accessToken: string,
  keyword: string,
): Promise<EmailMessage[]> {
  try {
    const query = `subject:${keyword} has:attachment filename:pdf OR filename:doc OR filename:docx`;

    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
      console.error("Gmail API error:", errorMsg, errorData);
      throw new Error(`Gmail search failed: ${errorMsg}`);
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Gmail search error:", message);
    throw new Error(`Failed to search Gmail: ${message}`);
  }
}

async function getMessageAttachment(
  accessToken: string,
  messageId: string,
  attachmentId: string,
): Promise<Buffer> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
      console.error("Attachment API error:", errorMsg, errorData);
      throw new Error(`Get attachment failed: ${errorMsg}`);
    }

    const data = await response.json();
    const base64Data = data.data;
    if (!base64Data) {
      throw new Error("No data in attachment response");
    }
    return Buffer.from(base64Data, "base64");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Attachment download error:", message);
    throw new Error(`Failed to download attachment: ${message}`);
  }
}

async function getMessageDetails(
  accessToken: string,
  messageId: string,
): Promise<EmailMessage> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
      console.error("Message details API error:", errorMsg, errorData);
      throw new Error(`Get message failed: ${errorMsg}`);
    }

    return response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Message details error:", message);
    throw new Error(`Failed to get message details: ${message}`);
  }
}

function calculateMatchScore(
  keyword: string,
  analysis: CVAnalysis,
  position?: string,
): number {
  let score = 0;
  const keywordLower = keyword.toLowerCase();

  // Check skills
  const matchingSkills = analysis.skills.filter(
    (skill) =>
      skill.toLowerCase().includes(keywordLower) ||
      keywordLower.includes(skill.toLowerCase()),
  ).length;
  score += matchingSkills * 10;

  // Check experience
  const matchingExp = analysis.experience.filter((exp) =>
    exp.toLowerCase().includes(keywordLower),
  ).length;
  score += matchingExp * 15;

  // Check education
  const matchingEdu = analysis.education.filter((edu) =>
    edu.toLowerCase().includes(keywordLower),
  ).length;
  score += matchingEdu * 5;

  // Base score for having skills, experience, and education
  if (analysis.skills.length > 0) score += 10;
  if (analysis.experience.length > 0) score += 15;
  if (analysis.education.length > 0) score += 10;

  // POSITION-BASED SCORING (if position provided)
  if (position) {
    const positionLower = position.toLowerCase();

    // Check if position keywords match skills (higher weight)
    const positionInSkills = analysis.skills.filter(
      (skill) =>
        positionLower.includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(positionLower.split(" ")[0]), // Match first word of position
    ).length;
    score += positionInSkills * 20; // Higher weight for position match

    // Check if position keywords match experience
    const positionInExp = analysis.experience.filter((exp) =>
      exp.toLowerCase().includes(positionLower),
    ).length;
    score += positionInExp * 15;

    // Years of experience (extract from summary if possible)
    const yearsMatch = analysis.summary.match(/(\d+)\s+years?/i);
    if (yearsMatch) {
      const years = parseInt(yearsMatch[1]);
      // Bonus for experience (prefer 3-10 years)
      if (years >= 3 && years <= 10) score += 15;
      else if (years >= 1 && years < 3) score += 5;
      else if (years > 10) score += 10; // Some bonus for 10+ years
    }
  }

  return Math.min(100, score);
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken, keyword, position } = await request.json();

    if (!accessToken || !keyword) {
      return NextResponse.json(
        { error: "Access token and keyword are required" },
        { status: 400 },
      );
    }

    // Validate token by making a simple API call
    console.log("Validating access token...");
    const validateResponse = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/profile",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!validateResponse.ok) {
      const errorData = await validateResponse.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || "Token validation failed";
      console.error("Token validation error:", errorMsg);
      return NextResponse.json(
        { error: `Invalid or expired access token: ${errorMsg}` },
        { status: 401 },
      );
    }

    // Search for messages with CVs
    console.log(`Searching Gmail with keyword: "${keyword}"`);
    const messages = await searchGmailMessages(accessToken, keyword);

    if (messages.length === 0) {
      return NextResponse.json({
        candidates: [],
        message: "No matching emails found",
      });
    }

    console.log(`Found ${messages.length} messages, processing...`);

    const candidates: Array<{
      email: string;
      subject: string;
      senderInfo: string;
      analysis: CVAnalysis;
      matchScore: number;
      messageId: string;
    }> = [];

    // Process each message
    for (const message of messages.slice(0, 10)) {
      try {
        const fullMessage = await getMessageDetails(accessToken, message.id);
        const headers = fullMessage.payload.headers;

        const subjectHeader = headers.find((h) => h.name === "Subject");
        const fromHeader = headers.find((h) => h.name === "From");

        const subject = subjectHeader?.value || "No Subject";
        const senderInfo = fromHeader?.value || "Unknown Sender";

        // Find PDF attachments
        const attachments: Array<{ id: string; filename: string }> = [];

        const processParts = (parts: any[]): void => {
          for (const part of parts) {
            if (
              part.mimeType === "application/pdf" ||
              part.mimeType === "application/msword" ||
              part.mimeType ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ) {
              if (part.body?.attachmentId) {
                attachments.push({
                  id: part.body.attachmentId,
                  filename: part.filename || "attachment",
                });
              }
            } else if (part.parts) {
              processParts(part.parts);
            }
          }
        };

        if (fullMessage.payload.parts) {
          processParts(fullMessage.payload.parts);
        }

        // Get and analyze first CV attachment
        if (attachments.length > 0) {
          const attachment = attachments[0];
          const pdfBuffer = await getMessageAttachment(
            accessToken,
            message.id,
            attachment.id,
          );
          const text = await extractTextFromPDF(pdfBuffer);
          const analysis = await analyzeWithOpenAI(text);
          const matchScore = calculateMatchScore(keyword, analysis, position);

          candidates.push({
            email: senderInfo,
            subject,
            senderInfo,
            analysis,
            matchScore,
            messageId: message.id,
          });
        }
      } catch (messageError) {
        const msg =
          messageError instanceof Error
            ? messageError.message
            : String(messageError);
        console.warn(`Failed to process message ${message.id}: ${msg}`);
        continue;
      }
    }

    // Sort by match score and return top 3
    const topCandidates = candidates
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    return NextResponse.json({
      candidates: topCandidates,
      totalFound: candidates.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("CV search error:", message);
    return NextResponse.json(
      {
        error: `CV search failed: ${message}`,
      },
      { status: 500 },
    );
  }
}
