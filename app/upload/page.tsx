"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { PDFUploadForm } from "@/components/PDFUploadForm";
import { Card, CardContent } from "@/components/ui";

export default function UploadPage() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleUploadSuccess = (filename: string) => {
    setUploadedFiles((prev) => [filename, ...prev]);
    // Refresh stats on dashboard
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📤 Upload Documents
            </h1>
            <p className="text-lg text-gray-600">
              Upload PDF files to make them searchable with AI
            </p>
          </div>

          {/* Upload Form */}
          <Card className="mb-8 bg-white">
            <CardContent>
              <PDFUploadForm onUploadSuccess={handleUploadSuccess} />
            </CardContent>
          </Card>

          {/* Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent>
                <h3 className="font-semibold text-blue-900 mb-2">
                  ✅ What We Support
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• PDF files up to 50MB</li>
                  <li>• Multi-page documents</li>
                  <li>• Text extraction & indexing</li>
                  <li>• Semantic search</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent>
                <h3 className="font-semibold text-green-900 mb-2">
                  🚀 How It Works
                </h3>
                <ol className="text-sm text-green-800 space-y-1">
                  <li>1. Upload a PDF</li>
                  <li>2. We extract & chunk text</li>
                  <li>3. Create AI embeddings</li>
                  <li>4. Make it searchable</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Recently Uploaded */}
          {uploadedFiles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ✨ Recently Uploaded
              </h2>
              <div className="space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200"
                  >
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-900">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
