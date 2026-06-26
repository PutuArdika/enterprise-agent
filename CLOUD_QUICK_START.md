# Cloud Database Quick Reference

## TL;DR - Get Started in 5 Minutes

### 1. Create Neon Account

Visit [neon.tech](https://neon.tech) → Sign up → Create project

### 2. Get Connection String

Dashboard → Connection string → Copy PostgreSQL URL

### 3. Update .env.local

```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### 4. Initialize Database

```bash
npm run db:migrate
```

### 5. Start Development

```bash
npm run dev
```

Done! Your app now uses cloud PostgreSQL.

---

## Connection String Format

### Neon (Recommended)

```
postgresql://neondb_owner:password@ep-cool-lab-12345.us-east-1.neon.tech/neondb?sslmode=require
```

### AWS RDS

```
postgresql://admin:password@my-instance.xxxxx.us-east-1.rds.amazonaws.com:5432/eka_db?sslmode=require
```

### Render

```
postgresql://user:password@dpg-xxxxx.render.com/eka_db?sslmode=require
```

### Railway

```
postgresql://user:password@railway.app:5432/eka_db?sslmode=require
```

### Supabase

```
postgresql://postgres:password@xxxxx.supabase.co:5432/postgres?sslmode=require
```

### Local

```
postgresql://putu_a@localhost:5432/eka_db
```

---

## NPM Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Run production build
npm run db:migrate       # Create/update database schema
npm run test:connection  # Test database connection
npm run db:reset         # ⚠️ Delete all data
```

---

## Environment Variables

### Required

```bash
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
```

### Optional

```bash
NODE_ENV=development          # or production
NEXT_PUBLIC_API_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...          # For Gmail feature
GOOGLE_CLIENT_SECRET=...
EMBEDDING_MODEL=text-embedding-3-small
```

---

## Common Issues & Solutions

| Issue                | Solution                                         |
| -------------------- | ------------------------------------------------ |
| Connection refused   | Check DATABASE_URL, ensure PostgreSQL is running |
| Auth failed          | Verify username/password in URL                  |
| No tables            | Run `npm run db:migrate`                         |
| SSL error            | Ensure `?sslmode=require` in URL                 |
| Slow after long wait | Neon free tier auto-suspends (normal)            |

---

## File Changes

### New Files

- `lib/db-config.ts` - Configuration management
- `CLOUD_SETUP.md` - Detailed setup guide
- `CLOUD_DB_MIGRATION.md` - Migration reference
- `CLOUD_RESTRUCTURE.md` - What changed

### Updated Files

- `lib/db.ts` - Cloud-aware database module
- `scripts/migrate.js` - Cloud-aware migrations
- `scripts/test-connection.js` - Better diagnostics
- `.env.example` - Cloud provider examples

### No Breaking Changes

All existing code works unchanged. The update is fully backward compatible.

---

## Database Schema

The app uses 4 tables:

### `documents`

Stores uploaded PDF metadata

- `id` - UUID primary key
- `filename` - Original filename
- `file_size` - Size in bytes
- `uploaded_at` - When uploaded
- `created_at, updated_at` - Timestamps

### `document_chunks`

Stores text chunks with embeddings

- `id` - UUID primary key
- `document_id` - References documents
- `content` - Chunk text
- `chunk_index` - Position in document
- `embedding` - Vector embedding (pgvector or JSON)
- `created_at, updated_at` - Timestamps

### `chat_history`

Stores Q&A conversations

- `id` - UUID primary key
- `user_message` - Question
- `ai_response` - Answer
- `document_id` - Related document
- `created_at` - Timestamp

### `statistics`

Stores usage analytics

- `id` - UUID primary key
- `documents_uploaded` - Count
- `total_chunks` - Count
- `total_embeddings` - Count
- `updated_at` - Last update

---

## Vercel Deployment Checklist

- [ ] Push code to GitHub
- [ ] Connect repo to Vercel
- [ ] Add `DATABASE_URL` environment variable
- [ ] Click Deploy
- [ ] Test at deployed URL

That's it! Vercel handles everything else.

---

## Neon-Specific Tips

### Free Tier

- 3 projects, 10 GB storage
- Auto-suspend after 5 min inactivity
- First request after suspend: ~1 second
- Great for development

### Database Branches

Create separate branches for dev/prod:

```bash
# Dev branch
DATABASE_URL=postgresql://...ep-cool-lab-xxxxx-dev.us-east-1.neon.tech/...

# Prod branch
DATABASE_URL=postgresql://...ep-cool-lab-xxxxx.us-east-1.neon.tech/...
```

### Scaling

- Upgrade to paid tier for always-on
- Increase compute size if needed
- Monitor in dashboard

---

## Advanced: Custom Configuration

If default settings don't work:

```bash
# Override connection pooling
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eka_db
DB_USER=postgres
DB_PASSWORD=password
DB_SSL=false

# Environment
NODE_ENV=production
```

See `lib/db-config.ts` for all options.

---

## Monitoring

Check database health:

```bash
npm run test:connection
```

This shows:

- Connection status
- Database version
- Installed extensions
- Table count
- Index count
- Full diagnostics

---

## Support & Resources

- **Neon Docs**: https://neon.tech/docs
- **PostgreSQL Docs**: https://postgresql.org/docs
- **Node pg Library**: https://node-postgres.com
- **Next.js Docs**: https://nextjs.org/docs

---

## Before & After

### Before (Local Only)

- Required local PostgreSQL installation
- Couldn't scale to production easily
- Manual connection management

### After (Cloud Ready)

- ✅ Works with cloud databases
- ✅ Scales to production
- ✅ Automatic configuration
- ✅ Works locally too
- ✅ No code changes needed
- ✅ Better error messages
- ✅ Healthchecks included

---

## Next Steps

1. ✅ Read this document
2. ✅ Create Neon account (optional, free tier available)
3. ✅ Update `DATABASE_URL` in `.env.local`
4. ✅ Run `npm run db:migrate`
5. ✅ Run `npm run test:connection`
6. ✅ Run `npm run dev`
7. ✅ Deploy to Vercel when ready

Questions? See the detailed guides:

- `CLOUD_SETUP.md` - Complete setup guide
- `CLOUD_DB_MIGRATION.md` - Migration reference
- `CLOUD_RESTRUCTURE.md` - What changed
