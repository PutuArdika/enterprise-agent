# Enterprise Knowledge Assistant (EKA)

An AI-powered internal knowledge management system that allows employees to upload documents, ask natural language questions, and receive answers based on AI analysis with source citations.

**Status:** Production-ready MVP  
**Version:** 1.0.0  
**Last Updated:** June 2026

## 🎯 Business Overview

### Problem

Employees need quick access to company knowledge spread across multiple PDFs without manually searching through documents.

### Solution

EKA provides an intelligent Q&A system that:

- Indexes company documents automatically
- Answers questions using only company knowledge
- Shows sources for transparency
- Delivers enterprise-grade security and performance

### Target Users

- IT Managers
- HR Personnel
- Operations Teams
- Knowledge Workers

---

## ✨ Features

### Core Features ✅

1. **📤 PDF Upload**
   - Drag-and-drop interface
   - File validation (type, size)
   - Automatic text extraction
   - AI embedding generation
   - Batch processing ready

2. **💬 Intelligent Chat**
   - Natural language questions
   - RAG-based answers
   - Source references
   - Conversation history
   - Loading states & error handling

3. **📚 Document Management**
   - Upload multiple documents
   - Track document statistics
   - View indexed chunks
   - Recent document list

4. **🔍 RAG Search**
   - Semantic similarity search
   - pgvector integration
   - Top-5 relevant results
   - Cosine similarity scoring

5. **📊 Dashboard**
   - Document count
   - Chunk statistics
   - Questions asked
   - Recent uploads

### Bonus Features 🚀

- ✅ Streaming responses (prepared)
- ✅ Conversation history (schema ready)
- ✅ Delete document (repository ready)
- ✅ Re-index document (service ready)
- ✅ Drag-and-drop upload (implemented)

---

## 🏗️ Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────────┬──────────────────┬──────────────────┐  │
│  │  Dashboard (/)   │ Upload (/upload) │   Chat (/chat)   │  │
│  │  • Stats         │  • Form          │  • Messages      │  │
│  │  • Recent docs   │  • Validation    │  • Sources       │  │
│  └──────────────────┴──────────────────┴──────────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                      Next.js App Router                       │
│  ┌──────────────────┬──────────────────┬──────────────────┐  │
│  │ POST /api/upload │ POST /api/chat   │ GET /api/stats   │  │
│  └──────────────────┴──────────────────┴──────────────────┘  │
└──────────┬──────────────────┬──────────────────┬──────────────┘
           │                  │                  │
    ┌──────▼────────┐  ┌─────▼─────────┐  ┌────▼──────────┐
    │ PDF Service   │  │ RAG Service   │  │ Repositories  │
    │ • Extraction  │  │ • Embed Q     │  │ • Documents   │
    │ • Chunking    │  │ • Vector      │  │ • Chunks      │
    │ • Embedding   │  │   Search      │  │               │
    │               │  │ • Answer Gen  │  └────┬──────────┘
    └──────┬────────┘  └─────┬─────────┘       │
           │                 │                 │
           └─────────────────┼─────────────────┘
                             │
        ┌────────────────────┴───────────────────┐
        │                                        │
    ┌───▼──────────────┐              ┌────────▼────────┐
    │   OpenAI API     │              │  PostgreSQL DB  │
    │ • Embeddings     │              │  • documents    │
    │ • Chat          │              │  • doc_chunks   │
    │                 │              │  • pgvector     │
    └─────────────────┘              └─────────────────┘
```

### Data Flow

```
UPLOAD FLOW:
User PDF → Validation → Text Extraction → Chunking →
Embedding Generation → DB Storage → Status Response

CHAT FLOW:
User Question → Embedding → Vector Search →
Context Building → LLM Processing → Answer + Sources → Response
```

### Directory Structure

```
eka-nextjs-prototype/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Tailwind CSS
│   ├── page.tsx                # Dashboard
│   ├── upload/
│   │   └── page.tsx            # Upload page
│   ├── chat/
│   │   └── page.tsx            # Chat page
│   └── api/
│       ├── upload/
│       │   └── route.ts        # PDF upload endpoint
│       ├── chat/
│       │   └── route.ts        # Question answering endpoint
│       └── stats/
│           └── route.ts        # Statistics endpoint
│
├── components/
│   ├── ui.tsx                  # Base UI components
│   ├── Navigation.tsx          # Navigation bar
│   ├── PDFUploadForm.tsx       # Upload form component
│   └── ChatInterface.tsx       # Chat interface component
│
├── services/
│   ├── pdf.ts                  # PDF parsing & embeddings
│   └── rag.ts                  # RAG pipeline
│
├── repositories/
│   ├── documents.ts            # Document queries
│   └── chunks.ts               # Document chunk queries
│
├── lib/
│   ├── db.ts                   # Database connection
│   └── openai.ts               # OpenAI client
│
├── types/
│   └── index.ts                # TypeScript definitions
│
├── migrations/
│   └── 001_init_schema.sql    # Database schema
│
├── scripts/
│   └── migrate.js              # Migration runner
│
├── .env.example                # Environment template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config
├── tailwind.config.js          # Tailwind config
└── README.md                   # This file
```

---

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** - App Router
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons (prepared)

### Backend

- **Next.js API Routes** - Serverless endpoints
- **Node.js** - Runtime

### AI/ML

- **OpenAI API** - Embeddings & LLM
  - Model: `text-embedding-3-small` (1536 dims)
  - Chat: `gpt-4-turbo`

### Database

- **PostgreSQL** (Neon) - Primary database
- **pgvector** - Vector similarity search
- **pg** - Node.js driver

### Additional Libraries

- **pdf-parse** - PDF text extraction
- **pdfjs-dist** - PDF.js worker
- **uuid** - ID generation

---

## 📋 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL database (Neon recommended)
- OpenAI API key

### Installation

#### 1. Clone & Setup

```bash
# Clone repository
git clone <repo-url>
cd eka-nextjs-prototype

# Install dependencies
npm install
```

#### 2. Environment Setup

```bash
# Copy example env
cp .env.example .env.local

# Fill in your values
OPENAI_API_KEY=sk_test_...
DATABASE_URL=postgresql://user:password@host:port/dbname
```

#### 3. Database Setup

```bash
# Run migrations
npm run db:migrate
```

This will:

- Enable pgvector extension
- Create `documents` table
- Create `document_chunks` table
- Create indexes for vector search

#### 4. Start Development

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000
```

---

## 🚀 Usage

### Upload Documents

1. Navigate to `/upload`
2. Drag & drop or select PDF files
3. System automatically:
   - Validates file type & size
   - Extracts text
   - Creates semantic chunks
   - Generates embeddings
   - Stores in database
4. Confirm success message

### Ask Questions

1. Navigate to `/chat`
2. Type your question in natural language
3. System:
   - Generates embedding for question
   - Finds relevant document chunks
   - Generates answer using LLM
   - Returns sources
4. View answer with citations

### View Dashboard

1. Go to `/` (home)
2. See statistics:
   - Total documents
   - Total chunks
   - Questions asked
   - Recent uploads

---

## 🔌 API Reference

### POST /api/upload

Upload and index a PDF document.

**Request:**

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@document.pdf"
```

**Response:**

```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "filename": "document.pdf",
    "file_size": 1024000,
    "uploaded_at": "2026-06-15T10:00:00Z",
    "created_at": "2026-06-15T10:00:00Z",
    "updated_at": "2026-06-15T10:00:00Z"
  },
  "message": "Document uploaded successfully with 42 chunks"
}
```

**Errors:**

- 400: Invalid file type or size
- 500: Processing failed

---

### POST /api/chat

Ask a question and get an AI-powered answer.

**Request:**

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the company policies?"}'
```

**Response:**

```json
{
  "success": true,
  "answer": "Based on the company policies document, employees...",
  "sources": [
    {
      "document": "policies.pdf",
      "excerpt": "Employees must follow the code of conduct which..."
    }
  ]
}
```

**Errors:**

- 400: Empty or invalid question
- 500: Processing failed

---

### GET /api/stats

Get system statistics.

**Request:**

```bash
curl http://localhost:3000/api/stats
```

**Response:**

```json
{
  "totalDocuments": 5,
  "totalChunks": 247,
  "totalQuestions": 42,
  "recentDocuments": [
    {
      "id": "uuid",
      "filename": "policy.pdf",
      "uploaded_at": "2026-06-15T10:00:00Z"
    }
  ]
}
```

---

## 🗄️ Database Schema

### documents

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### document_chunks

```sql
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id),
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536),           -- pgvector column
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_embedding ON document_chunks
  USING ivfflat (embedding vector_cosine_ops);
```

### chat_history (Bonus)

```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sources JSONB,
  asked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_history_asked_at ON chat_history(asked_at DESC);
```

---

## ⚙️ Configuration

### Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=sk_test_...           # Your OpenAI API key
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

# Database Configuration
DATABASE_URL=postgresql://...         # PostgreSQL connection string

# Chunking Configuration
CHUNK_SIZE=1000                       # Characters per chunk
CHUNK_OVERLAP=200                     # Overlap between chunks

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Tuning Parameters

**For better results, adjust:**

```typescript
// In services/pdf.ts
CHUNK_SIZE = 1000; // Smaller = more chunks, larger = less chunks
CHUNK_OVERLAP = 200; // More overlap = better context, slower processing

// In services/rag.ts
topK = 5; // More results = better context, slower LLM
```

---

## 🧪 Testing

### Test Upload

```bash
# Create a sample PDF for testing
npm run test:upload

# Check if database received chunks
psql $DATABASE_URL -c "SELECT COUNT(*) FROM document_chunks;"
```

### Test Chat

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is in the documents?"}'
```

---

## 📦 Building for Production

### Build

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Deploy to Other Platforms

The app is Vercel-compatible and can run on:

- Railway
- Render
- AWS Lambda
- DigitalOcean
- Self-hosted Node.js

---

## 🔒 Security Considerations

### Current Implementation

- ✅ Input validation
- ✅ File type checking
- ✅ File size limits
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS headers ready

### Recommended for Production

```typescript
// Add these:
- API rate limiting
- Authentication (NextAuth.js)
- Authorization (role-based)
- Audit logging
- Data encryption
- HTTPS only
- CORS configuration
- Request validation middleware
```

---

## 🚨 Error Handling

### Common Issues

#### "Cannot find module 'pg'"

```bash
npm install
npm run db:migrate
```

#### "pgvector extension not found"

```bash
# Run as database superuser
psql -d your_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

#### "OpenAI API key invalid"

- Check `OPENAI_API_KEY` in `.env.local`
- Verify key on openai.com dashboard
- Ensure key has access to embeddings & chat

#### "PDF extraction fails"

- Verify PDF is not corrupted
- Check file size (< 50MB)
- Ensure text is extractable (not image-only)

---

## 📈 Performance Optimization

### Already Implemented

- ✅ pgvector IVFFlat indexes for fast similarity search
- ✅ Connection pooling with pg
- ✅ Batch embedding generation
- ✅ Server-side rendering where possible

### Future Optimizations

- [ ] Redis caching for frequent questions
- [ ] Document similarity deduplication
- [ ] Streaming responses
- [ ] GraphQL API
- [ ] WebSocket for real-time updates

---

## 🎓 Key Concepts

### RAG (Retrieval-Augmented Generation)

Combines document retrieval with LLM generation:

1. User asks question
2. Convert question to embedding
3. Search database for similar embeddings
4. Retrieve relevant document chunks
5. Provide chunks as context to LLM
6. LLM generates answer using context only

### Vector Embeddings

- 1536-dimensional vectors (OpenAI text-embedding-3-small)
- Semantic meaning captured in high-dimensional space
- Similarity measured by cosine distance
- pgvector enables efficient similarity search

### Document Chunking

- Splits large documents into ~1000-char chunks
- 200-char overlap ensures context preservation
- Chunks stored separately for semantic search

---

## 📚 Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [PostgreSQL pgvector](https://github.com/pgvector/pgvector)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Related Tools

- [Neon PostgreSQL Hosting](https://neon.tech)
- [Vercel Deployment](https://vercel.com)
- [OpenAI Playground](https://platform.openai.com/playground)

---

## 📝 License

MIT License - feel free to use for your IT Manager interview!

---

## 🤝 Contributing

For improvements or bug fixes:

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR with description

---

## 📞 Support

For issues:

1. Check FAQ section
2. Review error logs
3. Check GitHub issues
4. Contact support team

---

**Built with ❤️ for Enterprise Knowledge Management**
# eka-prototype
