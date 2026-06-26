# Cloud Database Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│  (app/page.tsx, app/chat/page.tsx, app/upload/page.tsx)     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Routes (app/api/*)                      │
│  ├─ /api/upload       - PDF upload & chunking               │
│  ├─ /api/chat         - Q&A with embeddings                 │
│  ├─ /api/cv-analyzer  - CV analysis                         │
│  └─ /api/gmail        - Gmail integration                   │
└────────────────┬────────────────────────────────────────────┘
                 │
     ┌───────────┴───────────┬──────────────────┐
     │                       │                  │
     ▼                       ▼                  ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│  OpenAI API  │  │  RAG Service     │  │ Google Gmail │
│  - Chat      │  │  - Embeddings    │  │  API         │
│  - Embedding │  │  - Search        │  │              │
└──────────────┘  └────────┬─────────┘  └──────────────┘
                           │
                           ▼
                  ┌─────────────────────┐
                  │   lib/db.ts         │
                  │ (Database Module)   │
                  │ - query()           │
                  │ - transaction()     │
                  │ - getPoolStats()    │
                  └────────┬────────────┘
                           │
                  ┌────────▼──────────┐
                  │ lib/db-config.ts  │
                  │ Configuration     │
                  │ - getDatabaseConfig()
                  │ - getPoolConfig()
                  │ - getConnectionInfo()
                  └────────┬──────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
   ┌─────────────┐                   ┌──────────────┐
   │  Local DB   │                   │  Cloud DB    │
   │             │                   │              │
   │PostgreSQL   │                   │ • Neon       │
   │on localhost │                   │ • AWS RDS    │
   │             │                   │ • Render     │
   │ (dev)       │                   │ • Railway    │
   └─────────────┘                   │ • Supabase   │
                                     │ (production) │
                                     └──────────────┘
```

## Configuration Flow

```
START APP
    ▼
CHECK .env.local
    ▼
┌─────────────────────────────────────┐
│ Is DATABASE_URL set?                │
└────┬──────────────────────────┬─────┘
     │ YES                      │ NO
     ▼                          ▼
PARSE URL              USE DB_HOST/PORT/etc
     ▼                          ▼
DETECT CLOUD           DEFAULTS
PROVIDER               (localhost:5432)
     ▼                          ▼
   YES ──────────────┬──────────── NO
                     ▼
            ┌────────────────────┐
            │  ENABLE SSL/TLS    │
            │  sslmode=require   │
            └────────┬───────────┘
                     ▼
        ┌────────────────────────┐
        │  CONNECTION POOLING    │
        │  - Max: 20 (dev)       │
        │  - Max: 15 (prod)      │
        │  - Idle: 30s           │
        │  - Timeout: 5-10s      │
        └────────┬───────────────┘
                 ▼
        ┌────────────────────────┐
        │  CREATE POOL           │
        │  pg.Pool()             │
        └────────┬───────────────┘
                 ▼
        ┌────────────────────────┐
        │  READY FOR QUERIES     │
        └────────────────────────┘
```

## Database Connection Lifecycle

```
App Startup
    ▼
lib/db.ts loads lib/db-config.ts
    ▼
getDatabaseConfig() reads environment
    ▼
detectCloudDatabase(url)
    ├─ Neon? → SSL enabled
    ├─ RDS? → SSL enabled
    ├─ Local? → SSL disabled
    └─ Other? → SSL depends on URL
    ▼
getPoolConfig() sets limits
    ├─ Development? → max=20
    ├─ Production? → max=15
    └─ Always: timeout=30s
    ▼
pool = new Pool(config)
    ├─ on('connect') → log
    ├─ on('error') → handle
    └─ on('remove') → log
    ▼
Ready to handle queries
```

## Query Execution Flow

```
Application calls query(sql, params)
    ▼
Log start time
    ▼
pool.query(sql, params)
    ▼
┌──────────────────────────────────────┐
│  Get connection from pool            │
│  (create if needed, reuse if idle)   │
└──────────────┬───────────────────────┘
               ▼
    ┌──────────────────────────┐
    │  Execute query           │
    └──────┬───────────────────┘
           ▼
    ┌──────────────────────────┐
    │  Return to pool          │
    │  (for reuse)             │
    └──────┬───────────────────┘
           ▼
    ┌──────────────────────────┐
    │  Log result              │
    │  - Duration (ms)         │
    │  - Rows affected         │
    │  - Error (if any)        │
    └──────┬───────────────────┘
           ▼
    Return QueryResult to caller
```

## Data Flow: PDF Upload

```
User uploads PDF
    ▼
POST /api/upload
    ▼
┌──────────────────────────────────────┐
│  Extract text from PDF               │
│  (services/pdf.ts)                   │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────────────────────────┐
│  Split into chunks                   │
│  (Chunk size: 1000 chars)            │
│  (Overlap: 200 chars)                │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────────────────────────┐
│  Create embeddings                   │
│  OpenAI API: text-embedding-3-small  │
│  Dimensions: 1536                    │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────────────────────────┐
│  Store in database                   │
│  transaction:                        │
│  1. INSERT documents row             │
│  2. INSERT document_chunks rows      │
│  3. INSERT embeddings               │
│  4. COMMIT                           │
└──────┬───────────────────────────────┘
       ▼
    Success response
```

## Data Flow: Chat Q&A

```
User asks question
    ▼
POST /api/chat
    ▼
┌──────────────────────────────────────┐
│  Create embedding of question        │
│  OpenAI: text-embedding-3-small      │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────────────────────────┐
│  Search similar chunks               │
│  Vector similarity search            │
│  SELECT TOP 5 chunks                 │
│  WHERE embedding ~ question_vector   │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────────────────────────┐
│  Build context                       │
│  Combine top 5 chunks               │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────────────────────────┐
│  Ask OpenAI                          │
│  Prompt: context + question          │
│  Model: gpt-4 or gpt-3.5-turbo      │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────────────────────────┐
│  Store conversation                  │
│  INSERT chat_history row             │
│  - user_message                      │
│  - ai_response                       │
│  - document_id                       │
└──────┬───────────────────────────────┘
       ▼
    Return response to user
```

## Environment: Development vs Production

### Development

```
User Machine
    │
    └─ npm run dev
         │
         ├─ DATABASE_URL = local PostgreSQL
         │  or Neon dev branch
         │
         ├─ NODE_ENV = development
         │
         └─ Connection Pool
            - Max: 20
            - Verbose logging
            - Error details shown
```

### Production (Vercel)

```
Vercel Serverless
    │
    ├─ DATABASE_URL = Neon production
    │
    ├─ NODE_ENV = production
    │
    └─ Connection Pool
       - Max: 15
       - Minimal logging
       - Automatic failover
```

## SSL/TLS Handling

```
URL Analysis
    │
    ├─ Contains neon.tech? ──────┐
    ├─ Contains rds.amazonaws.com? ──┐
    ├─ Contains render.com? ──────┐
    ├─ Contains ?sslmode=require? ──┐
    │                             │
    ▼ (Any YES)                   ▼
SSL = { rejectUnauthorized: false }

    ▼
Pass to pg.Pool()
    ▼
Connection uses TLS 1.2+
```

## Error Handling Chain

```
Query Error Occurs
    ▼
Catch in query()
    │
    ├─ ECONNREFUSED
    │  └─ "Database server not running"
    │
    ├─ ENOTFOUND
    │  └─ "Cannot resolve hostname"
    │
    ├─ Authentication Error
    │  └─ "Invalid username/password"
    │
    ├─ Table does not exist
    │  └─ "Run npm run db:migrate"
    │
    └─ Other errors
       └─ Logged with context
    ▼
Log error message
    ▼
Throw to caller
```

## Connection Pool States

```
Initial: 0 connections

After Query 1:
┌──────────────────┐
│ Active: 1        │
│ Idle: 0          │
│ Waiting: 0       │
└──────────────────┘

After Query 2 (parallel):
┌──────────────────┐
│ Active: 2        │
│ Idle: 0          │
│ Waiting: 0       │
└──────────────────┘

Query 1 finishes:
┌──────────────────┐
│ Active: 1        │
│ Idle: 1          │
│ Waiting: 0       │
└──────────────────┘

After 30 seconds idle:
┌──────────────────┐
│ Active: 0        │
│ Idle: 0          │ (connection closed)
│ Waiting: 0       │
└──────────────────┘
```

## Deployment to Vercel

```
GitHub Repo
    ▼
Vercel Dashboard
    ├─ Connect Repo ✓
    ├─ Add Environment Variables
    │  └─ DATABASE_URL=postgresql://...
    ├─ Build
    │  ├─ npm install
    │  ├─ npm run build
    │  └─ Deploy artifacts
    └─ Run
       ├─ Serverless Functions
       └─ Static Files
           ▼
        Production URL
           ▼
     User accesses app
```

## Key Files & Their Roles

```
lib/db.ts
├─ query(sql, params) ──────────────────→ Execute queries
├─ getClient() ────────────────────────→ Manual transactions
├─ transaction(callback) ──────────────→ Auto transactions
├─ getPoolStats() ─────────────────────→ Pool monitoring
└─ closePool() ────────────────────────→ Graceful shutdown

lib/db-config.ts
├─ getDatabaseConfig() ────────────────→ Read env, build config
├─ getPoolConfig() ────────────────────→ Pool settings
├─ getConnectionInfo() ────────────────→ Parse connection details
├─ isCloudDatabase() ──────────────────→ Detect provider
└─ validateDatabaseConfig() ───────────→ Validate setup

scripts/migrate.js
├─ Load .env.local ────────────────────→ Get DATABASE_URL
├─ Detect cloud database ──────────────→ Set SSL if needed
├─ Read 001_init_schema.sql ───────────→ Get DDL
└─ Execute statements idempotently ────→ Create schema

scripts/test-connection.js
├─ Test connectivity ──────────────────→ Verify connection
├─ Show version ────────────────────────→ Database version
├─ List extensions ────────────────────→ Check pgvector
├─ Check tables ────────────────────────→ Verify schema
└─ Provide diagnostics ────────────────→ Troubleshooting
```

## Summary

The restructured architecture:

- ✅ Supports local and cloud databases
- ✅ Automatic SSL/TLS configuration
- ✅ Intelligent connection pooling
- ✅ Better error messages
- ✅ Production-ready
- ✅ Zero code changes needed
- ✅ Fully backward compatible
