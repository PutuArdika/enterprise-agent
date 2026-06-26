"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, Badge } from "@/components/ui";
import { StatsResponse, Document } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse>({
    totalDocuments: 0,
    totalChunks: 0,
    totalQuestions: 0,
    recentDocuments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Enterprise Multi Purpose Agent
          </h1>
          <p className="text-lg text-gray-600">
            Analyze documents, images, and websites with AI-powered intelligence
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white">
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {stats.totalDocuments}
                </div>
                <p className="text-gray-600">Documents Uploaded</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {stats.totalChunks}
                </div>
                <p className="text-gray-600">Text Chunks</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {stats.totalQuestions}
                </div>
                <p className="text-gray-600">Questions Asked</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        {stats.recentDocuments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📚 Recent Documents
            </h2>

            <div className="space-y-3">
              {stats.recentDocuments.map((doc: Document) => (
                <Card
                  key={doc.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {doc.filename}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {doc.file_size
                            ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB`
                            : "Size unknown"}{" "}
                          • Uploaded{" "}
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>✓ Indexed</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {stats.recentDocuments.length === 0 && !loading && (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <p className="text-gray-600 mb-4">No documents uploaded yet</p>
            <a
              href="/upload"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Upload your first document →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
