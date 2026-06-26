# EKA Architecture & Data Flow

## 🏗️ High-Level System Architecture

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                     PRESENTATION LAYER                       ┃
┃  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ ┃
┃  │ Dashboard   │  │ Upload Page  │  │ Chat Page           │ ┃
┃  │ (/         │  │ (/upload)    │  │ (/chat)             │ ┃
┃  │  - Stats   │  │ - Form       │  │ - Messages          │ ┃
┃  │  - Docs    │  │ - Validation │  │ - Sources           │ ┃
┃  └─────────────┘  └──────────────┘  └─────────────────────┘ ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━┬━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                           │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┷━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃               API LAYER (Next.js Route Handlers)              ┃
┃  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐┃
┃  │ POST /api/upload │  │ POST /api/   │  │ GET /api/stats   ││
┃  │                  │  │ chat         │  │                  ││
┃  │ Accepts: File    │  │              │  │ Returns:         ││
┃  │ Returns: Doc ID  │  │ Accepts: Q   │  │ - Count stats    ││
┃  │ + chunk count    │  │ Returns:     │  │ - Recent docs    ││
┃  │                  │  │ - Answer     │  │                  ││
┃  │                  │  │ - Sources    │  │                  ││
┃  └──────────────────┘  └──────────────┘  └──────────────────┘┃
┗━━━━━━━━━━━━━┬───────────────────────┬────────────────────────┘
              │                       │
┏━━━━━━━━━━━━━┷───────────────────────┷────────────────────────┓
┃            SERVICE LAYER (Business Logic)                     ┃
┃  ┌──────────────────────────┐  ┌──────────────────────────┐  ┃
┃  │ PDF Service              │  │ RAG Service              │  ┃
┃  │ ├─ Extract text          │  │ ├─ Embed question       │  ┃
┃  │ ├─ Chunk text            │  │ ├─ Search similar       │  ┃
┃  │ ├─ Generate embeddings   │  │ ├─ Build context        │  ┃
┃  │ └─ Batch embeddings      │  │ ├─ Generate answer      │  ┃
┃  │                          │  │ └─ Extract sources      │  ┃
┃  └──────────────────────────┘  └──────────────────────────┘  ┃
┗━━━━━━━━━━━━━┬────────────────────────────────────────────┬───┘
              │                                            │
┏━━━━━━━━━━━━━┷────────────────────────────────────────────┷───┓
┃         DATA ACCESS LAYER (Repositories)                      ┃
┃  ┌──────────────────────────┐  ┌──────────────────────────┐  ┃
┃  │ Document Repository      │  │ Chunks Repository        │  ┃
┃  │ ├─ Create document       │  │ ├─ Create chunk         │  ┃
┃  │ ├─ Get document          │  │ ├─ Get chunks           │  ┃
┃  │ ├─ List documents        │  │ ├─ Search similar       │  ┃
┃  │ ├─ Count documents       │  │ └─ Count chunks         │  ┃
┃  │ └─ Delete document       │  │                         │  ┃
┃  └──────────────────────────┘  └──────────────────────────┘  ┃
┗━━━━━━━━━━━━━┬──────────────────────────────────────┬──────────┘
              │                                      │
              │                  ┌───────────────────┘
              │                  │
┏━━━━━━━━━━━━━┷──────────────────┷──────────────────────────────┓
┃              EXTERNAL SERVICES & DATABASE                      ┃
┃  ┌──────────────────┐  ┌────────────────────────────────────┐ ┃
┃  │ OpenAI API       │  │ PostgreSQL Database                │ ┃
┃  │ ├─ Embeddings    │  │ ├─ documents table                 │ ┃
┃  │ │  (1536 dims)   │  │ ├─ document_chunks table           │ ┃
┃  │ └─ Chat Completions   │ │   (with pgvector column)    │ ┃
┃  │    (GPT-4)       │  │ ├─ pgvector indexes                │ ┃
┃  │                  │  │ └─ chat_history table              │ ┃
┃  └──────────────────┘  └────────────────────────────────────┘ ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 📤 PDF Upload Flow

```
User uploads PDF
        │
        ↓
File Validation
├─ Check type = PDF ✓
├─ Check size < 50MB ✓
└─ Check exists ✓
        │
        ↓
POST /api/upload
        │
        ↓
PDF Service: Extract Text
├─ Load PDF file
├─ Parse all pages
└─ Combine into single text
        │
        ↓
PDF Service: Chunk Text
├─ Split into ~1000 char chunks
├─ Add 200 char overlap
└─ Filter empty chunks
        │
        ↓
PDF Service: Generate Embeddings
├─ Batch texts (up to 100 at a time)
├─ Call OpenAI text-embedding-3-small
├─ Get 1536-dimensional vectors
└─ Collect all embeddings
        │
        ↓
Document Repository: Create Document
├─ Insert into documents table
├─ Get UUID back
└─ Return document ID
        │
        ↓
Chunks Repository: Create Chunks
├─ For each chunk:
│  ├─ Insert content
│  ├─ Insert embedding vector
│  └─ Link to document_id
└─ Store all chunks
        │
        ↓
Response to User
├─ Document ID
├─ Number of chunks created
└─ Success message
```

---

## 💬 Question Answering Flow (RAG)

```
User asks question in Chat
        │
        ↓
Input Validation
├─ Check not empty ✓
├─ Check < 2000 chars ✓
└─ Trim whitespace ✓
        │
        ↓
POST /api/chat
        │
        ↓
RAG Service: Embed Question
├─ Take question text
├─ Call OpenAI text-embedding-3-small
└─ Get 1536-dimensional vector
        │
        ↓
RAG Service: Search Similar Chunks
├─ Query PostgreSQL with embedding
├─ Use pgvector cosine similarity: <=>
├─ Order by 1 - (embedding <=> question_embedding)
└─ LIMIT 5 (top 5 chunks)
        │
        ↓
RAG Service: Build Context
├─ Collect top 5 chunks
├─ Format as "[Reference N]"
└─ Join with newlines
        │
        ↓
RAG Service: Generate Answer
├─ Build prompt:
│  ├─ System: "Answer only from context"
│  ├─ Context: [chunk text from above]
│  └─ Question: [user's question]
├─ Call OpenAI gpt-4-turbo
└─ Get answer text
        │
        ↓
RAG Service: Extract Sources
├─ Get unique document IDs from chunks
├─ For each document:
│  ├─ Get filename
│  ├─ Get first 2 chunks
│  ├─ Extract first 150 chars as excerpt
│  └─ Create source object
└─ Return sources array
        │
        ↓
Response to User
├─ Answer text
└─ Sources array
    ├─ Document filename
    └─ Excerpt from chunk
```

---

## 🗄️ Database Schema & Relationships

```
┌─────────────────────────────────────────────────────────────┐
│ documents                                                    │
├─────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                              │
│ filename (VARCHAR 255)                                      │
│ file_size (BIGINT)                                         │
│ uploaded_at (TIMESTAMP)                                     │
│ created_at (TIMESTAMP)                                      │
│ updated_at (TIMESTAMP)                                      │
└────────────────┬──────────────────────────────────────────┘
                 │
                 │ 1:N relationship
                 │
┌────────────────▼──────────────────────────────────────────┐
│ document_chunks                                            │
├─────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                              │
│ document_id (UUID, FK → documents.id)                      │
│ content (TEXT)                                              │
│ chunk_index (INTEGER)                                       │
│ embedding (vector(1536)) ← pgvector column!               │
│ created_at (TIMESTAMP)                                      │
│ updated_at (TIMESTAMP)                                      │
│                                                             │
│ Indexes:                                                    │
│ - idx_document_id (for joins)                              │
│ - idx_embedding (IVFFlat, for similarity search)           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ chat_history (Optional/Bonus)                               │
├─────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                              │
│ question (TEXT)                                             │
│ answer (TEXT)                                               │
│ sources (JSONB) ← Stores [{doc, excerpt}...]               │
│ asked_at (TIMESTAMP)                                        │
│ created_at (TIMESTAMP)                                      │
│                                                             │
│ Index:                                                      │
│ - idx_asked_at (for ordering by time)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Vector Search Operation

```
Question Embedding
        │
        ├─ 1536-dimensional vector
        └─ Example: [0.234, -0.15, 0.89, ...]
                │
                ↓
PostgreSQL Query
        │
        ├─ SELECT * FROM document_chunks
        ├─ ORDER BY embedding <=> question_embedding DESC
        │          ↑ This is cosine similarity operator
        └─ LIMIT 5
                │
                ↓
IVFFlat Index
        │
        ├─ Inverted File Flat partitioning
        ├─ ~100 clusters
        ├─ Searches nearest clusters first
        └─ Fast approximate search (vs brute force)
                │
                ↓
Top 5 Chunks Returned
        │
        ├─ Ordered by similarity
        ├─ Most relevant first
        └─ Used for context in LLM prompt
```

---

## 🔐 Data Security Flow

```
User Input
        │
        ↓
Type Validation (TypeScript)
├─ File: File type
├─ Question: string
└─ All inputs checked
        │
        ↓
Runtime Validation
├─ File size check
├─ Question length check
└─ Empty check
        │
        ↓
SQL Injection Prevention
├─ All queries use $1, $2, ... parameters
├─ No string concatenation
└─ pg library handles escaping
        │
        ↓
Environment Variables
├─ OPENAI_API_KEY never in code
├─ DATABASE_URL never in code
└─ Loaded from .env.local
        │
        ↓
Safe Deployment
├─ Environment vars in deployment platform
├─ No secrets in git
└─ Production ready
```

---

## 📊 Information Flow Example

**Complete flow: Upload PDF → Ask Question → Get Answer with Sources**

```
1. USER UPLOADS "company-policy.pdf"
   ↓
2. Extract: 5000 chars of text
   ↓
3. Chunk: 5 chunks of ~1000 chars each
   ↓
4. Embed: Generate 5 × 1536-dim vectors
   ↓
5. Store:
   - documents table: 1 row
   - document_chunks table: 5 rows (with vectors)
   ↓
6. USER ASKS: "What is the vacation policy?"
   ↓
7. Embed question: 1 × 1536-dim vector
   ↓
8. Search: Find 5 most similar chunks
   Query: SELECT * FROM document_chunks
          ORDER BY embedding <=> [question_vector]
          LIMIT 5
   ↓
9. Results:
   - Chunk 1: "Employees get 20 days..." (0.92 similarity)
   - Chunk 2: "Vacation must be..." (0.88 similarity)
   - Chunk 3: "PTO can be..."      (0.85 similarity)
   - (plus 2 more)
   ↓
10. Build Context: "Based on document chunks, here's..."
    ↓
11. Call LLM:
    System: "Answer only from context"
    Context: [above chunks]
    User: "What is vacation policy?"
    ↓
12. LLM Returns: "Based on the company policy document..."
    ↓
13. Extract Sources:
    - Document: "company-policy.pdf"
    - Excerpt: "Employees get 20 days vacation per year..."
    ↓
14. Send to User:
    {
      answer: "Based on company policy...",
      sources: [{
        document: "company-policy.pdf",
        excerpt: "Employees get 20 days..."
      }]
    }
    ↓
15. USER SEES:
    - Answer in chat
    - Source card with document name
    - Quote from original document
```

---

## 🎯 Component Relationships

```
Navigation (App-wide)
    │
    ├─→ Home Page (/)
    │   └─→ Fetches /api/stats
    │       └─→ Dashboard display
    │
    ├─→ Upload Page (/upload)
    │   └─→ PDFUploadForm component
    │       └─→ POST /api/upload
    │           └─→ Stores in database
    │
    └─→ Chat Page (/chat)
        └─→ ChatInterface component
            └─→ POST /api/chat
                └─→ RAG pipeline
                    └─→ Displays answer + sources
```

---

## 🚀 Scalability Considerations

```
Current Implementation (1 user, 1 upload):
└─ Works perfectly

Scale to 10 users:
├─ Connection pooling ✓ (built-in)
└─ Ready to go

Scale to 100 users:
├─ pgvector IVFFlat indexes ✓ (built-in)
├─ Batch embeddings ✓ (built-in)
└─ Ready to go

Scale to 1000 users:
├─ Add Redis caching (easy add)
├─ Document deduplication (easy add)
└─ Sharding ready

Scale to 10,000 users:
├─ Multi-region PostgreSQL (Neon supports)
├─ CDN for static assets (Vercel built-in)
└─ Streaming responses (OpenAI ready)

Scale beyond:
├─ Microservices architecture
├─ Message queues for embeddings
└─ Advanced caching strategies
```

---

## 📈 Performance Metrics

```
API Response Times (Typical):

/api/upload
├─ File validation: ~10ms
├─ PDF extraction: ~100-500ms (depends on PDF)
├─ Chunking: ~10ms
├─ Embedding generation: ~2000-5000ms (network to OpenAI)
├─ Database insert: ~50ms
└─ Total: ~2-6 seconds

/api/chat
├─ Input validation: ~5ms
├─ Question embedding: ~500ms (OpenAI call)
├─ Vector search: ~20ms (pgvector)
├─ Answer generation: ~2000-3000ms (LLM call)
├─ Source extraction: ~50ms
└─ Total: ~2.5-3.5 seconds

/api/stats
├─ Count queries: ~20ms each
├─ Recent documents: ~30ms
└─ Total: ~100-150ms
```

---

**Diagram Last Updated:** June 15, 2026  
**Status:** ✅ Complete
