# NPM Scripts - Neon DB Support

## Overview

All database scripts have been updated to automatically support both local PostgreSQL and cloud databases (Neon, RDS, Render, Railway, Supabase, etc.).

---

## Scripts

### `npm run dev`

**Starts the development server**

```bash
npm run dev
```

**What it does:**

- Starts Next.js development server on http://localhost:3000
- Loads DATABASE*URL or DB*\* from .env.local
- Auto-detects local vs cloud database
- Configures SSL/TLS automatically

**Supports:**
✅ Local PostgreSQL
✅ Cloud PostgreSQL (Neon, RDS, etc.)

---

### `npm run db:migrate`

**Creates or updates database schema**

```bash
npm run db:migrate
```

**What it does:**

1. Reads .env.local (looks for DATABASE*URL or DB*\* parameters)
2. Detects if database is local or cloud
3. Auto-enables SSL for cloud databases
4. Executes SQL migrations from `migrations/001_init_schema.sql`
5. Creates tables: documents, document_chunks, chat_history, statistics
6. Creates indexes for performance
7. Installs pgvector extension (if available)

**Idempotent:** ✅ Safe to run multiple times

**Supports:**
✅ Local PostgreSQL
✅ Neon DB
✅ AWS RDS
✅ Render
✅ Railway
✅ Supabase
✅ All PostgreSQL providers

**Example Output:**

```
🔄 Connecting to database...

   Type: Cloud PostgreSQL
   Host: ep-cool-lab-12345.us-east-1.neon.tech
   Database: neondb
   User: neondb_owner

✅ Connected to database

🔧 Executing migration...

📊 Found 12 SQL statements

   ✅ CREATE TABLE documents...
   ✅ CREATE TABLE document_chunks...
   ✅ CREATE TABLE chat_history...
   ✅ CREATE TABLE statistics...
   ✅ CREATE INDEX idx_document_chunks...
   ⏭️ Already exists...

✅ Migration completed: 8 executed, 4 skipped

📋 Created/Updated tables:
   ✓ chat_history
   ✓ document_chunks
   ✓ documents
   ✓ statistics
```

---

### `npm run test:connection`

**Tests database connection and shows diagnostics**

```bash
npm run test:connection
```

**What it does:**

1. Reads .env.local configuration
2. Detects database type (local or cloud)
3. Tests connection
4. Shows database version
5. Lists installed extensions
6. Checks for required tables
7. Lists indexes
8. Provides helpful error messages if issues found

**Use this to:**

- Verify DATABASE_URL is correct
- Check database connectivity
- See what tables exist
- Diagnose connection issues
- Verify SSL configuration

**Example Output:**

```
🔍 Database Diagnostics

Environment Check:
✓ DATABASE_URL set: true
✓ OPENAI_API_KEY set: true

📡 Connection Details:
✓ Type: Cloud PostgreSQL
✓ Host: ep-cool-lab-12345.us-east-1.neon.tech
✓ Port: 5432
✓ Database: neondb
✓ User: neondb_owner
✓ SSL: Yes

⏳ Testing connection...
   Connecting...
   ✅ Connected successfully!

📊 Database Version:
   PostgreSQL 15.2 on x86_64-pc-linux-gnu

🔧 Checking Extensions:
   ✓ plpgsql
   ✓ vector

📋 Database Tables:
   ✓ chat_history (10 columns)
   ✓ document_chunks (8 columns)
   ✓ documents (6 columns)
   ✓ statistics (5 columns)

   ✅ All required tables exist

🔑 Indexes:
   chat_history: 2 indexes
   document_chunks: 3 indexes
   documents: 1 index
   statistics: 1 index

✅ Database diagnostics complete!
```

---

### `npm run db:setup`

**Sets up local PostgreSQL (local development only)**

```bash
npm run db:setup
```

**What it does:**

- Installs PostgreSQL via Homebrew (if needed)
- Creates local database: `eka_db`
- Sets PostgreSQL password
- Grants privileges
- Runs migrations automatically
- Installs pgvector extension

**Note:** This is for **local development only**. For cloud databases, skip this.

**Supports:**
✅ Local PostgreSQL on macOS (via Homebrew)

**Requires:**

- Homebrew installed
- Admin/sudo access

---

### `npm run db:reset`

**⚠️ DELETES ALL DATA - Resets database**

```bash
npm run db:reset
```

**What it does:**

1. Prompts for confirmation (must type "yes")
2. Connects to database
3. Truncates all tables (empties them)
4. Leaves schema intact (tables still exist)
5. Doesn't delete database, just data

**Supports:**
✅ Local PostgreSQL
✅ Neon DB
✅ AWS RDS
✅ Render
✅ Railway
✅ Supabase
✅ All PostgreSQL providers

**⚠️ WARNING:**

- This **DELETES ALL DATA**
- Confirmation prompt is required
- Cannot be undone
- Use with caution!

**Example Output:**

```
🧹 Database Reset Script

⚠️ WARNING: This will DELETE ALL DATA

🔍 Database Info:
   Type: Cloud PostgreSQL
   Host: ep-cool-lab-12345.us-east-1.neon.tech
   Database: neondb
   User: neondb_owner

⚠️ This will DELETE ALL DATA. Are you sure? (yes/no): yes

🔄 Connecting to database...
✅ Connected

🧹 Truncating all tables...

   ✅ chat_history
   ✅ document_chunks
   ✅ documents
   ✅ statistics

✨ Database reset complete!
📊 Truncated: 4 tables, Skipped: 0
```

---

## Environment Variables

### Required

```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### Optional (if DATABASE_URL not set)

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eka_db
DB_USER=postgres
DB_PASSWORD=password
```

### Optional (override SSL behavior)

```bash
DB_SSL=true   # Force SSL on
DB_SSL=false  # Force SSL off (local only)
```

---

## Connection String Examples

### Neon (Recommended)

```bash
DATABASE_URL=postgresql://neondb_owner:password@ep-cool-lab-12345.us-east-1.neon.tech/neondb?sslmode=require
```

### AWS RDS

```bash
DATABASE_URL=postgresql://admin:password@my-instance.xxxxx.us-east-1.rds.amazonaws.com:5432/eka_db?sslmode=require
```

### Render

```bash
DATABASE_URL=postgresql://user:password@dpg-xxxxx.render.com/eka_db?sslmode=require
```

### Railway

```bash
DATABASE_URL=postgresql://user:password@railway.app:5432/eka_db?sslmode=require
```

### Supabase

```bash
DATABASE_URL=postgresql://postgres:password@xxxxx.supabase.co:5432/postgres?sslmode=require
```

### Local

```bash
DATABASE_URL=postgresql://putu_a@localhost:5432/eka_db
```

---

## Key Changes

### What Changed

- ✅ Removed `NODE_TLS_REJECT_UNAUTHORIZED=0` from all scripts
- ✅ Added cloud database detection to all scripts
- ✅ Auto-enables SSL/TLS for cloud providers
- ✅ Better error messages and diagnostics
- ✅ Improved logging and formatting
- ✅ Added confirmation prompt to `db:reset`

### Why

- Cloud databases like Neon require proper SSL/TLS
- `NODE_TLS_REJECT_UNAUTHORIZED=0` bypasses security checks (not recommended)
- Scripts now automatically detect and configure SSL appropriately
- Better support for all PostgreSQL providers

### Backward Compatibility

✅ All existing configurations still work
✅ Local PostgreSQL still works perfectly
✅ No breaking changes
✅ Same npm script interface

---

## Usage Workflow

### First Time Setup (Local)

```bash
npm run db:setup          # Install PostgreSQL & create DB
npm run test:connection   # Verify connection
npm run dev              # Start development
```

### First Time Setup (Cloud - Neon)

```bash
# 1. Create Neon account & project
# 2. Copy connection string to DATABASE_URL in .env.local
npm run db:migrate       # Create schema
npm run test:connection  # Verify connection
npm run dev             # Start development
```

### Regular Development

```bash
npm run dev              # Start development server
npm run test:connection  # Check database health
```

### Switch from Local to Cloud

```bash
# 1. Update DATABASE_URL in .env.local
npm run test:connection  # Verify new connection
npm run db:migrate       # Create schema in cloud
npm run dev             # Start with cloud DB
```

### Reset Database

```bash
npm run db:reset         # Delete all data (local & cloud)
npm run db:migrate       # Recreate schema
npm run dev             # Start fresh
```

---

## Troubleshooting

### "Connection refused"

```bash
# For local:
brew services start postgresql

# For cloud:
- Verify DATABASE_URL is correct
- Check database is active in provider dashboard
```

### "Authentication failed"

- Verify username and password in DATABASE_URL
- Check for special characters (URL encode if needed)
- For Neon: Use the provided role name (usually neondb_owner)

### "SSL error"

- Cloud databases require SSL
- Ensure `?sslmode=require` in URL
- Scripts now handle this automatically

### "Tables don't exist"

```bash
npm run db:migrate
```

### "Connection too slow"

- Neon free tier auto-suspends after 5 minutes
- First request takes ~1 second (normal)
- Upgrade to paid plan for always-on

### Need diagnostics?

```bash
npm run test:connection
```

---

## Cloud Providers Supported

All scripts automatically detect and configure these:

- ✅ **Neon** (neon.tech) - Recommended for free tier
- ✅ **AWS RDS** (rds.amazonaws.com)
- ✅ **Render** (postgres.render.com)
- ✅ **Railway** (railway.app)
- ✅ **Supabase** (supabase.co)
- ✅ **Heroku Postgres** (heroku.com)
- ✅ **DigitalOcean** (digitalocean.com)
- ✅ **Google Cloud SQL** (cloud.google.com)
- ✅ **Azure Database** (azure.com)
- ✅ **Any PostgreSQL endpoint**

---

## Performance Notes

### Local Development

- Connection pooling: 20 connections (dev), 15 (prod)
- No SSL overhead
- Immediate responses

### Cloud Development (Neon Free Tier)

- Connection pooling: 20 connections (dev), 15 (prod)
- SSL/TLS encrypted
- Auto-suspend after 5 min inactivity
- First request: ~1 second (wake-up time)

### Cloud Production (Paid Plans)

- Connection pooling: 15 connections
- SSL/TLS encrypted
- Always-on (no suspend)
- Consistent response times
- Monitor in provider dashboard

---

## Next Steps

1. **Choose database:**
   - Local: `npm run db:setup`
   - Cloud: Get connection string, set DATABASE_URL

2. **Initialize:**

   ```bash
   npm run db:migrate
   npm run test:connection
   ```

3. **Start developing:**

   ```bash
   npm run dev
   ```

4. **Deploy to Vercel (optional):**
   - Add DATABASE_URL to Vercel environment
   - Push to GitHub
   - Vercel auto-deploys

---

## Summary

| Script                    | Purpose                | Supports      |
| ------------------------- | ---------------------- | ------------- |
| `npm run dev`             | Start development      | Local + Cloud |
| `npm run db:migrate`      | Create schema          | Local + Cloud |
| `npm run test:connection` | Test connection        | Local + Cloud |
| `npm run db:setup`        | Setup local PostgreSQL | Local only    |
| `npm run db:reset`        | Delete all data        | Local + Cloud |

All scripts are **production-ready** and **Neon DB compatible**! 🚀
