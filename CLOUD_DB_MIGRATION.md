# Cloud PostgreSQL Migration Guide (Neon DB)

This guide helps you migrate from local PostgreSQL to cloud-hosted PostgreSQL (Neon DB).

## Quick Start

### 1. Create a Neon Account

- Go to [neon.tech](https://neon.tech)
- Sign up with GitHub or email
- Create a new project

### 2. Get Your Connection String

In your Neon dashboard:

1. Click "Connection string"
2. Copy the **PostgreSQL** connection string (looks like: `postgresql://user:password@host.neon.tech/database?sslmode=require`)

### 3. Update .env.local

Replace your local `DATABASE_URL` with the Neon connection string:

```bash
# Old (Local PostgreSQL)
# DATABASE_URL=postgresql://putu_a@localhost:5432/eka_db

# New (Neon Cloud PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxxxx.neon.tech/dbname?sslmode=require
```

### 4. Run Migrations

```bash
npm run db:migrate
```

This will automatically:

- Create all tables (documents, document_chunks, chat_history)
- Set up indexes for performance
- Install pgvector extension (for embeddings)

### 5. Deploy to Vercel (Optional)

If you want to deploy your Next.js app to Vercel:

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add `DATABASE_URL` environment variable in Vercel settings
4. Deploy!

## Configuration Details

### SSL/TLS Connection

Neon DB requires SSL connections. The connection string includes `?sslmode=require` which is automatically handled by the `pg` library.

### Connection Pooling

The app uses the following pool settings:

- **Max connections**: 20 (adjustable for your plan)
- **Idle timeout**: 30 seconds
- **Connection timeout**: 5 seconds

For Neon's free tier, you may want to reduce max connections:

```typescript
// In lib/db.ts, change:
max: 10,  // Instead of 20
```

### Embedded Database (Optional)

If you want to keep local development simple, you can use Neon's branching feature:

1. Create a development branch in Neon
2. Use that for local development
3. Keep production branch separate

## Troubleshooting

### Connection Refused

- Check that DATABASE_URL is correct in .env.local
- Verify your Neon project is active
- Check network connectivity

### Permission Denied

- Ensure the database user has proper permissions
- In Neon dashboard: go to "Roles" and verify permissions

### Slow Queries

- Check indexes are created: `npm run db:migrate`
- Monitor query performance in Neon dashboard
- Consider adjusting connection pool size

### pgvector Extension Not Available

- Neon supports pgvector with newer versions
- If unavailable, embeddings are stored as JSONB arrays instead
- This is automatic and compatible with the app

## Environment Variables Reference

```bash
# Required
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Optional (used only if DATABASE_URL not set)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eka_db
DB_USER=postgres
DB_PASSWORD=password

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
```

## Database Scripts

All scripts now support both local and cloud PostgreSQL:

```bash
# Run migrations (creates tables, indexes, extensions)
npm run db:migrate

# Test database connection
npm run test:connection

# Reset database (warning: deletes all data)
npm run db:reset
```

## Performance Tips

### For Development

- Use Neon free tier's development branch
- Connection pool defaults work fine

### For Production

- Monitor connections in Neon dashboard
- Set appropriate max pool size
- Use connection pooling proxy if needed
- Enable query logs for debugging

## Next Steps

1. Create Neon account and project
2. Update DATABASE_URL in .env.local
3. Run `npm run test:connection` to verify
4. Run `npm run db:migrate` to initialize schema
5. Start development with `npm run dev`
6. Deploy to Vercel when ready

## Support

- Neon docs: https://neon.tech/docs
- PostgreSQL docs: https://www.postgresql.org/docs
- Next.js docs: https://nextjs.org/docs
