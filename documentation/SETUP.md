# EKA Quick Setup Guide

## 5-Minute Setup

### Step 1: Install Dependencies (2 min)

```bash
npm install
```

**If you get npm errors**, try:

```bash
npm install --legacy-peer-deps
```

### Step 2: Configure Environment (1 min)

```bash
cp .env.example .env.local

# Edit .env.local and add:
# - OPENAI_API_KEY from https://platform.openai.com/api-keys
# - DATABASE_URL from your PostgreSQL provider (Neon recommended)
```

### Step 3: Setup Database (1 min)

```bash
npm run db:migrate
```

### Step 4: Start Server (1 min)

```bash
npm run dev
```

### Step 5: Test

Visit http://localhost:3000 in your browser

---

## ✅ Checklist Before Interview

- [ ] npm install completed without errors
- [ ] .env.local has valid OPENAI_API_KEY
- [ ] .env.local has valid DATABASE_URL
- [ ] npm run db:migrate succeeded
- [ ] npm run dev starts without errors
- [ ] http://localhost:3000 loads dashboard
- [ ] Upload page at http://localhost:3000/upload works
- [ ] Chat page at http://localhost:3000/chat loads
- [ ] Test upload a sample PDF
- [ ] Test asking a question about uploaded PDF

---

## Getting API Keys

### OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy and paste into .env.local
4. **Important:** Add $5 credit or payment method to your account

### PostgreSQL Database (Neon)

1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project
4. Copy "Connection string"
5. Paste as DATABASE_URL in .env.local

---

## Common Issues & Solutions

### Error: "Cannot find module 'pg'"

**Solution:** Run `npm install` again

### Error: "pgvector extension not found"

**Solution:** Run `npm run db:migrate` again

### Error: "OpenAI API key is invalid"

**Solution:**

1. Check key at https://platform.openai.com/api-keys
2. Ensure you have credits/payment method
3. Copy fresh key to .env.local

### Error: "Database connection failed"

**Solution:**

1. Check DATABASE_URL format
2. Verify URL from your database provider
3. Ensure firewall allows connections

### Chat not working

**Solution:**

1. Verify OPENAI_API_KEY is valid
2. Upload a PDF first via /upload page
3. Check browser console for errors

---

## Demo Script

### 1. Dashboard Demo (30 sec)

- Show stats at `/`
- Explain tracking of documents, chunks, questions

### 2. Upload Demo (1 min)

- Go to `/upload`
- Show drag-and-drop
- Upload sample PDF
- Show success message

### 3. Chat Demo (2 min)

- Go to `/chat`
- Ask question about uploaded PDF
- Show answer and sources
- Ask another question to show system works

### 4. Code Review (2 min)

- Show folder structure
- Explain TypeScript types
- Show RAG pipeline in `services/rag.ts`
- Explain database schema

---

## Interview Talking Points

1. **Architecture**
   - "I used Next.js App Router for modern React patterns"
   - "Separated concerns: components, services, repositories"
   - "TypeScript for type safety"

2. **RAG Implementation**
   - "PDF text extraction with pdf-parse"
   - "Semantic chunking for better context"
   - "OpenAI embeddings for meaning"
   - "pgvector for fast similarity search"

3. **Scalability**
   - "Batch embedding generation"
   - "Indexed vector search with IVFFlat"
   - "Connection pooling"
   - "Vercel-ready deployment"

4. **Security**
   - "Input validation and file type checking"
   - "SQL injection prevention with parameterized queries"
   - "Ready for auth implementation"

5. **Production-Readiness**
   - "Error handling throughout"
   - "Environment configuration"
   - "Database migrations"
   - "Logging for debugging"

---

## Features to Highlight

✅ **Core MVP:**

- PDF upload with validation
- Intelligent RAG search
- Source citations
- Professional UI

✅ **Bonus Implemented:**

- Drag-and-drop upload
- Conversation history schema
- Chat UI like ChatGPT
- Statistics dashboard

⚡ **Ready to Build:**

- Streaming responses (OpenAI streaming ready)
- Delete documents (repository functions exist)
- Authentication (NextAuth.js integration points)
- Conversation history storage

---

## Files to Review During Interview

1. **services/rag.ts** - RAG pipeline (most impressive)
2. **components/ChatInterface.tsx** - User-facing chat (interactive demo)
3. **lib/db.ts** - Database connection (show scalability)
4. **types/index.ts** - Type safety (mention TypeScript benefits)
5. **migrations/001_init_schema.sql** - Database design (show pgvector usage)

---

## Time Breakdown for Interview

- **Introduction:** 2 minutes
- **Live Demo:** 5 minutes (1 min upload + 2 min chat + 2 min explore)
- **Architecture Explanation:** 3 minutes
- **Code Review:** 3 minutes
- **Q&A:** 5-10 minutes

**Total:** 15-25 minutes (fits typical IT manager interview window)

---

## If Something Breaks During Interview

1. **Restart server:** Ctrl+C, then `npm run dev`
2. **Check database:** `psql $DATABASE_URL -c "SELECT COUNT(*) FROM documents;"`
3. **Clear cache:** Delete `.next` folder, run `npm run build`
4. **Pivot to code review:** "Let me show you the architecture while that's running..."
5. **Have backup:** Screenshot of working app for reference

---

**Good luck with your interview! 🚀**
