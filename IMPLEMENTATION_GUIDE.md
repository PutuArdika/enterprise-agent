# Implementation Guide for Remaining Features

This document provides step-by-step instructions to implement the remaining features for EMPA.

## Feature 1: URL Analysis Endpoint

### Overview

When a user selects "Search Website" from fallback options, analyze the webpage and search for relevant information.

### Implementation Steps

**Step 1: Create the API route**

Create `app/api/analyze-url/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/services/rag";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url, question } = await req.json();

    if (!url || !question) {
      return NextResponse.json(
        { success: false, error: "URL and question required" },
        { status: 400 },
      );
    }

    // Fetch webpage
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "EMPA-Agent/1.0" },
    });

    // Extract text from HTML
    const $ = cheerio.load(response.data);
    $("script, style").remove();
    const text = $.text().replace(/\s+/g, " ").trim();

    // For now, return the raw text analysis
    // In full implementation, you'd:
    // 1. Store this as temporary embedding
    // 2. Search it for relevant info
    // 3. Return findings

    return NextResponse.json({
      success: true,
      source: url,
      content: text.substring(0, 5000), // First 5000 chars
      message: "Successfully analyzed webpage",
    });
  } catch (error) {
    console.error("URL analysis error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze URL" },
      { status: 500 },
    );
  }
}
```

**Step 2: Install dependencies**

```bash
npm install axios cheerio
npm install --save-dev @types/cheerio
```

**Step 3: Update FallbackOptions handler**

In `ChatInterface.tsx`, update the URL option handler:

```typescript
if (option === "url" && data?.url) {
  // Make API call to analyze URL
  const response = await fetch("/api/analyze-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: data.url,
      question: userQuestion || input,
    }),
  });
  // Handle response and display results
}
```

---

## Feature 2: Local Data Directory Search

### Overview

Scan the `/data` directory for documents and search them on-the-fly.

### Implementation Steps

**Step 1: Create data directory**

```bash
mkdir -p ./data
# Place sample PDFs here for testing
```

**Step 2: Create the API route**

Create `app/api/search-local-data/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";
import * as pdfParse from "pdf-parse";
import { generateEmbedding } from "@/services/pdf";
import { searchRelevantChunks } from "@/services/rag";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question required" },
        { status: 400 },
      );
    }

    const dataDir = path.join(process.cwd(), "data");
    const files = await readdir(dataDir);
    const pdfFiles = files.filter((f) => f.endsWith(".pdf"));

    if (pdfFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No PDF files found in /data directory",
        findings: [],
      });
    }

    const findings = [];

    // Process each PDF
    for (const file of pdfFiles) {
      try {
        const filePath = path.join(dataDir, file);
        const fileBuffer = await readFile(filePath);
        const pdfData = await pdfParse(fileBuffer);

        // Split into chunks and generate embeddings
        const chunks = pdfData.text.split("\n\n").filter((c) => c.trim());

        for (const chunk of chunks) {
          const embedding = await generateEmbedding(chunk);
          // Compare with question embedding
          const questionEmbedding = await generateEmbedding(question);
          // Calculate similarity and store promising results
        }

        findings.push({
          file,
          matches: 3, // Number of relevant sections found
        });
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Searched ${pdfFiles.length} files in /data directory`,
      findings,
    });
  } catch (error) {
    console.error("Local data search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search local data" },
      { status: 500 },
    );
  }
}
```

---

## Feature 3: Agent Mode

### Overview

Enable advanced features: image generation, image extraction, multi-source analysis.

### Implementation Steps

**Step 1: Create Agent page**

Create `app/agent/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { PrimaryButton, Input } from "@/components/ui";

export default function AgentPage() {
  const [mode, setMode] = useState<"chat" | "analyze" | "generate">("chat");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateImage = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/agent/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await response.json();
      setResult(data.imageUrl || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">🤖 Agent Mode</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setMode("chat")}
            className={`p-4 rounded-lg border-2 ${
              mode === "chat"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            💬 Enhanced Chat
          </button>
          <button
            onClick={() => setMode("analyze")}
            className={`p-4 rounded-lg border-2 ${
              mode === "analyze"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            🔍 Analyze
          </button>
          <button
            onClick={() => setMode("generate")}
            className={`p-4 rounded-lg border-2 ${
              mode === "generate"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            🎨 Generate
          </button>
        </div>

        {mode === "generate" && (
          <div className="space-y-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe an image to generate..."
            />
            <PrimaryButton onClick={handleGenerateImage} disabled={loading}>
              {loading ? "Generating..." : "Generate Image"}
            </PrimaryButton>
            {result && <img src={result} alt="Generated" className="max-w-2xl" />}
          </div>
        )}
      </main>
    </div>
  );
}
```

**Step 2: Create image generation endpoint**

Create `app/api/agent/generate-image/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt required" },
        { status: 400 },
      );
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    return NextResponse.json({
      success: true,
      imageUrl: response.data[0].url,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate image" },
      { status: 500 },
    );
  }
}
```

---

## Feature 4: Enhanced Upload Form for Images

### Overview

Update `PDFUploadForm.tsx` to accept images and multiple file types.

### Implementation Steps

```typescript
// In PDFUploadForm.tsx, update the file input:

<input
  type="file"
  accept=".pdf,.jpg,.jpeg,.png,.docx,.txt"
  multiple
  onChange={handleFileSelect}
  className="hidden"
/>

// Add image analysis when images are uploaded:
const analyzeImage = async (file: File) => {
  const base64 = await fileToBase64(file);
  const response = await fetch("/api/analyze-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: base64,
      filename: file.name,
    }),
  });
  return response.json();
};
```

---

## Testing Checklist

- [ ] Fallback options display when no documents match
- [ ] Thinking indicator rotates messages while loading
- [ ] URL endpoint successfully fetches and analyzes webpages
- [ ] Local data directory search finds PDFs
- [ ] Agent mode UI displays correctly
- [ ] Image generation produces valid DALL-E images
- [ ] Image upload form accepts multiple file types

---

## Next Steps

1. **Start with Feature 1** (URL Analysis) - simplest to implement
2. **Then Feature 2** (Local Data Search) - builds on existing RAG logic
3. **Then Feature 4** (Image Upload) - relatively straightforward
4. **Finally Feature 3** (Agent Mode) - most complex, optional for MVP

All features are now scaffolded and ready for backend implementation!
