"use client";

import { useState } from "react";
import { PrimaryButton, Input } from "./ui";

interface FallbackOptionsProps {
  onSelectOption: (option: string, data?: any) => void;
  isLoading?: boolean;
}

export function FallbackOptions({
  onSelectOption,
  isLoading = false,
}: FallbackOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const handleUploadPDF = () => {
    setSelectedOption("upload");
    onSelectOption("upload");
  };

  const handleEnterURL = () => {
    setSelectedOption("url");
  };

  const handleURLSubmit = () => {
    if (urlInput.trim()) {
      onSelectOption("url", { url: urlInput });
      setUrlInput("");
      setSelectedOption(null);
    }
  };

  const handleSearchLocalData = () => {
    setSelectedOption("local");
    onSelectOption("local");
  };

  const handleEnableAgentMode = () => {
    onSelectOption("agent-mode");
  };

  return (
    <div className="mt-6 space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
      <p className="text-sm font-semibold text-gray-700 mb-4">
        ℹ️ No matching information found. Try one of these options:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Option 1: Upload PDF */}
        <button
          onClick={handleUploadPDF}
          disabled={isLoading}
          className="p-4 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition text-left disabled:opacity-50"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <p className="font-semibold text-gray-900">Upload Document</p>
              <p className="text-sm text-gray-600">Add another PDF to search</p>
            </div>
          </div>
        </button>

        {/* Option 2: Enter URL */}
        <div className="p-4 border border-gray-300 rounded-lg hover:border-blue-400 transition">
          {selectedOption === "url" ? (
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 text-sm">
                📱 Enter Website URL
              </p>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 text-sm"
                  disabled={isLoading}
                />
                <PrimaryButton
                  onClick={handleURLSubmit}
                  disabled={isLoading || !urlInput.trim()}
                  className="text-sm px-3"
                >
                  Search
                </PrimaryButton>
              </div>
              <button
                onClick={() => setSelectedOption(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleEnterURL}
              disabled={isLoading}
              className="w-full text-left"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔗</span>
                <div>
                  <p className="font-semibold text-gray-900">Search Website</p>
                  <p className="text-sm text-gray-600">Analyze a web page</p>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Option 3: Search Local Data */}
        <button
          onClick={handleSearchLocalData}
          disabled={isLoading}
          className="p-4 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-400 transition text-left disabled:opacity-50"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">💾</span>
            <div>
              <p className="font-semibold text-gray-900">Search Local Data</p>
              <p className="text-sm text-gray-600">Check /data directory</p>
            </div>
          </div>
        </button>

        {/* Option 4: Agent Mode */}
        <button
          onClick={handleEnableAgentMode}
          disabled={isLoading}
          className="p-4 border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition text-left disabled:opacity-50"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="font-semibold text-gray-900">Agent Mode</p>
              <p className="text-sm text-gray-600">
                Advanced analysis & generation
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Additional info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
        <p>
          💡 <strong>Agent Mode</strong> unlocks image generation, image
          extraction from PDFs, and multi-source analysis.
        </p>
      </div>
    </div>
  );
}
