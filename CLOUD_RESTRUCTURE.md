# Project Restructure: Cloud PostgreSQL Support

This document explains the changes made to support cloud PostgreSQL databases like Neon DB.

## What Changed

### New Files Created

1. **`lib/db-config.ts`** - Configuration module
   - Unified database configuration
   - Auto-detects cloud vs local databases
   - Handles SSL/TLS setup
   - Validates configuration on startup

2. **`lib/db-cloud.ts`** - Alternative implementation
   - Same functionality as updated `lib/db.ts`
   - Use `lib/db.ts` instead (more actively maintained)

3. **`CLOUD_SETUP.md`** - Setup guide
   - Step-by-step instructions for Neon
   - Examples for other cloud providers
   - Troubleshooting section
   - Performance tips

4. **`CLOUD_DB_MIGRATION.md`** - Migration reference
   - Quick start guide
   - Configuration details
   - Script descriptions

### Updated Files

1. **`lib/db.ts`** - Database module
   - Now uses `lib/db-config.ts` for configuration
   - Improved error messages
   - Added `transaction()` function
   - Added `getPoolStats()` function
   - Proper shutdown handlers

2. **`scripts/migrate.js`** - Migration script
   - Cloud database detection
   - Better error handling
   - Improved logging
   - Idempotent operations

3. **`scripts/test-connection.js`** - Connection test
   - Cloud provider detection
   - Detailed diagnostics
   - Better troubleshooting hints
   - Shows database version & extensions

4. **`.env.example`** - Environment template
   - Cloud provider examples
   - Clear documentation
   - Better organization

## How It Works

### Automatic Configuration

The app now uses this priority order:

```
1. DATABASE_URL (recommended for cloud)
   ↓
2. Individual DB_* parameters (for local or custom)
   ↓
3. Defaults (localhost, eka_db, etc.)
```

### Cloud Database Detection

When `DATABASE_URL` is provided:

- Checks if host contains cloud provider domains
- Automatically enables SSL/TLS
- Adjusts connection timeouts
- Configures connection pooling

### Example Configurations

**Neon (Cloud)**

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
```

**Local PostgreSQL**

```bash
DATABASE_URL=postgresql://putu_a@localhost:5432/eka_db
# or
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eka_db
```

## Migration Steps

### Step 1: No Code Changes Needed

The app is fully backward compatible. Your existing code works as-is.

### Step 2: Update Environment Variables

**Before (local):**

```bash
DATABASE_URL=postgresql://putu_a@localhost:5432/eka_db
```

**After (cloud - Neon example):**

```bash
DATABASE_URL=postgresql://neondb_owner:password@ep-cool-lab-12345.us-east-1.neon.tech/neondb?sslmode=require
```

### Step 3: Test Connection

```bash
npm run test:connection
```

### Step 4: Run Migrations

```bash
npm run db:migrate
```

### Step 5: Start Development

```bash
npm run dev
```

## Database Scripts

All scripts now support both local and cloud databases:

### `npm run db:migrate`

Creates/updates database schema:

- Creates tables (documents, document_chunks, chat_history, statistics)
- Creates indexes (for performance)
- Installs pgvector extension (if available)
- Idempotent (safe to run multiple times)

### `npm run test:connection`

Tests database connectivity:

- Verifies connection can be established
- Shows database version
- Lists installed extensions
- Checks for required tables
- Provides helpful error messages

### `npm run db:reset`

⚠️ **Deletes all data**

- Removes all tables
- Removes all data
- Starts fresh

## Configuration Details

### Connection Pooling

Automatically adjusts based on environment:

| Parameter               | Local Dev | Cloud Dev | Production |
| ----------------------- | --------- | --------- | ---------- |
| max                     | 20        | 20        | 15         |
| idleTimeoutMillis       | 30s       | 30s       | 30s        |
| connectionTimeoutMillis | 5s        | 10s       | 10s        |
| statement_timeout       | 15s       | 30s       | 30s        |

### SSL/TLS

- **Cloud databases**: Automatically enabled
- **Local databases**: Disabled by default
- **Custom override**: Set `DB_SSL=true/false`

### Supported Cloud Providers

- ✅ Neon
- ✅ AWS RDS
- ✅ Render
- ✅ Railway
- ✅ Supabase
- ✅ Heroku Postgres
- ✅ DigitalOcean
- ✅ Google Cloud SQL
- ✅ Azure Database
- ✅ Any PostgreSQL endpoint

## Database Module API

### `query(text, params?)`

Execute parameterized SQL query:

```typescript
const result = await query("SELECT * FROM documents WHERE id = $1", [
  documentId,
]);
```

### `getClient()`

Get a client for manual transaction handling:

```typescript
const client = await getClient();
try {
  await client.query("BEGIN");
  // Your queries
  await client.query("COMMIT");
} catch (err) {
  await client.query("ROLLBACK");
}
```

### `transaction(callback)`

Execute callback in a transaction:

```typescript
await transaction(async (client) => {
  await client.query("INSERT ...");
  await client.query("UPDATE ...");
});
```

### `getPoolStats()`

Get connection pool statistics:

```typescript
const stats = getPoolStats();
// { totalConnections: 5, idleConnections: 3, waitingRequests: 0 }
```

### `closePool()`

Close all connections (for shutdown):

```typescript
await closePool();
```

## Vercel Deployment

To deploy to Vercel:

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variable:
   ```
   DATABASE_URL=postgresql://user:pass@cloud-host/db?sslmode=require
   ```
4. Deploy!

The app will:

- Auto-detect cloud database
- Enable SSL automatically
- Configure connection pooling
- Run on Vercel's serverless environment

## Troubleshooting

### "Connection refused"

- **Local**: Ensure PostgreSQL is running
  ```bash
  brew services start postgresql
  ```
- **Cloud**: Check database URL is correct

### "No tables found"

- Run migrations:
  ```bash
  npm run db:migrate
  ```

### "Authentication failed"

- Verify username/password in DATABASE_URL
- For Neon: Use the provided role name

### "SSL error"

- Cloud databases require SSL
- Check `?sslmode=require` in URL
- App handles this automatically

### "pgvector not available"

- Not all cloud providers have pgvector
- App falls back to JSONB storage
- No code changes needed

## Backward Compatibility

✅ **All existing code works unchanged**

The restructure:

- Maintains same `db` module exports
- Keeps query interface identical
- Adds new features (transactions, stats)
- Fully backward compatible

You can:

- Keep using local PostgreSQL
- Switch to cloud gradually
- Mix local dev with cloud production
- Run tests against either

## Performance Notes

### Local Development

- Connection pooling works great
- Use default settings
- No SSL overhead

### Cloud (Neon Free Tier)

- Databases auto-suspend after 5 minutes
- First request takes ~1 second
- Suitable for development
- Upgrade for production workloads

### Cloud (Paid Plans)

- Keep databases always-on
- No auto-suspend delays
- Consistent performance
- Use for production

## Next Steps

1. **Try Neon** - Free tier is generous
2. **Update .env.local** - Add cloud DATABASE_URL
3. **Test Connection** - Run `npm run test:connection`
4. **Run Migrations** - Run `npm run db:migrate`
5. **Test App** - Run `npm run dev`
6. **Deploy** - Push to Vercel

## Questions?

- See `CLOUD_SETUP.md` for detailed setup
- See `CLOUD_DB_MIGRATION.md` for quick reference
- Run `npm run test:connection` for diagnostics
- Check cloud provider's documentation

## Summary

The project is now **cloud-ready**. Switch databases anytime by updating `DATABASE_URL`.

- ✅ Neon DB supported
- ✅ AWS RDS supported
- ✅ All PostgreSQL providers supported
- ✅ Local development still works
- ✅ Production-ready
- ✅ No code changes needed
