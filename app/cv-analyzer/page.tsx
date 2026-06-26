"use client";

import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { PrimaryButton } from "@/components/ui";
import { Card, CardContent } from "@/components/ui";

interface CVAnalysis {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: string[];
  education: string[];
  summary: string;
}

export default function CVAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (
        !selectedFile.name.endsWith(".pdf") &&
        !selectedFile.type.includes("pdf")
      ) {
        setError("Please upload a PDF file");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cv-analyzer", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze CV");
      }

      setAnalysis(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const mockEvent = {
        target: { files: [droppedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(mockEvent);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📄 CV Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Upload your CV (PDF) and let AI analyze your skills, experience, and
            qualifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card className="bg-white">
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-5xl mb-4">📤</div>
                  <p className="font-semibold text-gray-900 mb-2">
                    {file ? file.name : "Upload CV"}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {file
                      ? "Click to change file"
                      : "Drag and drop your PDF here or click to select"}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    ⚠️ {error}
                  </div>
                )}

                {file && !error && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    ✅ File selected: {file.name}
                  </div>
                )}

                <PrimaryButton
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className="w-full mt-6"
                >
                  {loading ? "Analyzing..." : "Analyze CV"}
                </PrimaryButton>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2">
            {!analysis && !loading && (
              <Card className="bg-white">
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      Ready to Analyze Your CV?
                    </h2>
                    <p className="text-gray-600">
                      Upload a PDF file to get started. We'll extract and
                      analyze your:
                    </p>
                    <ul className="mt-6 space-y-3 text-left max-w-md mx-auto">
                      <li className="flex items-center gap-3">
                        <span>💼</span>
                        <span>Professional experience</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span>🎓</span>
                        <span>Educational background</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span>🛠️</span>
                        <span>Technical and soft skills</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span>📝</span>
                        <span>Professional summary</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading && (
              <Card className="bg-white">
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="flex gap-2 mb-6">
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" />
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100" />
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200" />
                    </div>
                    <p className="text-gray-700 font-medium">
                      Analyzing your CV...
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Extracting text, skills, and experience details
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {analysis && (
              <div className="space-y-6">
                {/* Contact Info */}
                {(analysis.name || analysis.email || analysis.phone) && (
                  <Card className="bg-white">
                    <CardContent>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        👤 Contact Information
                      </h3>
                      <div className="space-y-2">
                        {analysis.name && (
                          <p>
                            <span className="font-medium text-gray-700">
                              Name:
                            </span>{" "}
                            <span className="text-gray-600">
                              {analysis.name}
                            </span>
                          </p>
                        )}
                        {analysis.email && (
                          <p>
                            <span className="font-medium text-gray-700">
                              Email:
                            </span>{" "}
                            <span className="text-gray-600">
                              {analysis.email}
                            </span>
                          </p>
                        )}
                        {analysis.phone && (
                          <p>
                            <span className="font-medium text-gray-700">
                              Phone:
                            </span>{" "}
                            <span className="text-gray-600">
                              {analysis.phone}
                            </span>
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Summary */}
                {analysis.summary && (
                  <Card className="bg-white">
                    <CardContent>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        📋 Professional Summary
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {analysis.summary}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Skills */}
                {analysis.skills.length > 0 && (
                  <Card className="bg-white">
                    <CardContent>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        🛠️ Skills ({analysis.skills.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Experience */}
                {analysis.experience.length > 0 && (
                  <Card className="bg-white">
                    <CardContent>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        💼 Experience ({analysis.experience.length})
                      </h3>
                      <div className="space-y-3">
                        {analysis.experience.map((exp, idx) => (
                          <div
                            key={idx}
                            className="pb-3 border-b border-gray-200 last:border-b-0"
                          >
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {exp}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Education */}
                {analysis.education.length > 0 && (
                  <Card className="bg-white">
                    <CardContent>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        🎓 Education ({analysis.education.length})
                      </h3>
                      <div className="space-y-3">
                        {analysis.education.map((edu, idx) => (
                          <div
                            key={idx}
                            className="pb-3 border-b border-gray-200 last:border-b-0"
                          >
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {edu}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Analyze Another */}
                <button
                  onClick={() => {
                    setAnalysis(null);
                    setFile(null);
                    fileInputRef.current?.click();
                  }}
                  className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  📄 Analyze Another CV
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
