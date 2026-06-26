"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { PrimaryButton, Alert } from "./ui";

interface UploadFormProps {
  onUploadStart?: () => void;
  onUploadSuccess?: (filename: string) => void;
  onUploadError?: (error: string) => void;
}

export function PDFUploadForm({
  onUploadStart,
  onUploadSuccess,
  onUploadError,
}: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (selectedFile: File | null) => {
    setError(null);
    setSuccess(null);

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      const msg = "Please select a PDF file";
      setError(msg);
      onUploadError?.(msg);
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      const msg = "File size must be less than 50MB";
      setError(msg);
      onUploadError?.(msg);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    onUploadStart?.();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(`Successfully uploaded "${file.name}" with ${data.message}`);
      setFile(null);
      onUploadSuccess?.(file.name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      onUploadError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50 text-red-700">{error}</Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-700">
          {success}
        </Alert>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
          disabled={loading}
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <div className="text-4xl mb-2">📄</div>
          <p className="text-lg font-medium text-gray-900">
            {file ? file.name : "Drag and drop your PDF here"}
          </p>
          <p className="text-sm text-gray-600 mt-2">or click to browse</p>
          <p className="text-xs text-gray-500 mt-4">Maximum file size: 50MB</p>
        </label>
      </div>

      {file && (
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">📋 {file.name}</p>
          <p className="text-xs text-gray-600 mt-1">
            Size: {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      <PrimaryButton
        type="submit"
        disabled={!file || loading}
        className="w-full"
      >
        {loading ? "⏳ Uploading..." : "🚀 Upload PDF"}
      </PrimaryButton>
    </form>
  );
}
