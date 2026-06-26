/**
 * Validation utilities for file uploads and API requests
 */

export const ALLOWED_FILE_TYPES = ["application/pdf"];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MIN_FILE_SIZE = 1024; // 1KB

export function validateFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file exists
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Only PDF files are supported. Got: ${file.type}`,
    };
  }

  // Check file size - minimum
  if (file.size < MIN_FILE_SIZE) {
    return {
      valid: false,
      error: "File is too small (minimum 1KB)",
    };
  }

  // Check file size - maximum
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File is too large (maximum 50MB). Got: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  return { valid: true };
}

export function validateQuestion(question: string): {
  valid: boolean;
  error?: string;
} {
  if (!question || typeof question !== "string") {
    return { valid: false, error: "Question must be a string" };
  }

  const trimmed = question.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Question cannot be empty" };
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: "Question cannot exceed 2000 characters" };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "").substring(0, 255);
}
