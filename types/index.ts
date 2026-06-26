// Document and chunks types
export interface Document {
  id: string;
  filename: string;
  file_size?: number;
  uploaded_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  similarity?: number;
  created_at: Date;
  updated_at: Date;
}

// API Request/Response types
export interface UploadResponse {
  success: boolean;
  document?: Document;
  message?: string;
  error?: string;
}

export interface ChatRequest {
  question: string;
}

export interface ChatSource {
  document: string;
  excerpt: string;
}

export interface ChatResponse {
  success: boolean;
  answer?: string;
  sources?: ChatSource[];
  noDocumentsFound?: boolean;
  message?: string;
  error?: string;
}

export interface StatsResponse {
  totalDocuments: number;
  totalChunks: number;
  totalQuestions: number;
  recentDocuments: Document[];
}

// Chat history types (bonus feature)
export interface ChatHistoryEntry {
  id: string;
  question: string;
  answer: string;
  sources: ChatSource[];
  asked_at: Date;
  created_at: Date;
}

// Embedding types
export interface EmbeddingRequest {
  text: string;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
}
