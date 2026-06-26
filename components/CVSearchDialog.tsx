"use client";

import { useState } from "react";
import { PrimaryButton, Input } from "./ui";

interface CVSearchDialogProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSearch: (keyword: string) => void;
  isLoading?: boolean;
}

export function CVSearchDialog({
  isOpen,
  email,
  onClose,
  onSearch,
  isLoading = false,
}: CVSearchDialogProps) {
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!keyword.trim()) {
      setError("Please enter a search keyword");
      return;
    }

    onSearch(keyword);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-2">Search Gmail for CVs</h2>
        <p className="text-sm text-gray-600 mb-4">Email: {email}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Subject Keyword
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Example: "software engineer application", "job application", etc.
            </p>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., software engineer application"
              disabled={isLoading}
              className="w-full"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <PrimaryButton
              type="submit"
              disabled={isLoading || !keyword.trim()}
              className="flex-1"
            >
              {isLoading ? "⏳ Searching..." : "Search"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
