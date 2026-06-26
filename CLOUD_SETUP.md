# Cloud PostgreSQL Setup Guide

## Overview

This project now supports both **local** and **cloud** PostgreSQL databases. The configuration automatically detects and adapts to your database setup.

## Quick Start with Neon DB (Recommended for Cloud)

### 1. Create a Neon Account

- Visit [https://neon.tech](https://neon.tech)
- Sign up with GitHub or email
- Create a new project
- Free tier includes: 3 projects, 10 GB storage, auto-suspend after 1 week

### 2. Get Your Connection String

In your Neon dashboard:

1. Navigate to **Connection string** on the dashboard
2. Select **PostgreSQL** (not "Connection pooler")
3. Copy the full connection string

It will look like:

```
postgresql://neondb_owner:AbCdEfG1234@ep-cool-lab-12345.us-east-1.neon.tech/neondb?sslmode=require
```

### 3. Update .env.local

Replace the `DATABASE_URL` in your `.env.local`:

```bash
# Remove or comment out these if using cloud:
# DATABASE_URL=postgresql://putu_a@localhost:5432/eka_db
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=eka_db
# DB_USER=postgres
# DB_PASSWORD=

# Add your Neon connection string:
DATABASE_URL=postgresql://neondb_owner:AbCdEfG1234@ep-cool-lab-12345.us-east-1.neon.tech/neondb?sslmode=require
```

### 4. Initialize Database Schema

```bash
npm run db:migrate
```

This will:

- Create `documents` table
- Create `document_chunks` table
- Create `chat_history` table
- Create `statistics` table
- Set up all indexes
- Install pgvector extension (if available)

### 5. Test Connection

```bash
npm run test:connection
```

### 6. Start Development

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

## Other Cloud Database Providers

The app works with any PostgreSQL provider:

### AWS RDS

```bash
DATABASE_URL=postgresql://username:password@my-instance.xxxxx.us-east-1.rds.amazonaws.com:5432/dbname?sslmode=require
```

### Render

```bash
DATABASE_URL=postgresql://username:password@dpg-xxxxx.render.com/dbname?sslmode=require
```

### Railway

```bash
DATABASE_URL=postgresql://username:password@railway.app:5432/dbname?sslmode=require
```

### Supabase

```bash
DATABASE_URL=postgresql://[user]:[password]@[host].supabase.co:5432/[database]?sslmode=require
```

### Heroku Postgres

```bash
DATABASE_URL=postgres://username:password@ec2-xxxxx.compute-1.amazonaws.com:5432/dbname?sslmode=require
```

### DigitalOcean

```bash
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[dbname]?sslmode=require
```

## Configuration Options

### Environment Variables

**Required:**

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

**Optional (for local PostgreSQL only):**

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eka_db
DB_USER=postgres
DB_PASSWORD=password
DB_SSL=false
```

**Application Settings:**

```bash
NODE_ENV=development          # development, production, test
NEXT_PUBLIC_API_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
```

### Database Connection Pooling

The app automatically adjusts pooling based on environment:

| Setting            | Development               | Production |
| ------------------ | ------------------------- | ---------- |
| Max Connections    | 20                        | 15         |
| Idle Timeout       | 30s                       | 30s        |
| Connection Timeout | 5s (local) / 10s (cloud)  | 10s        |
| Statement Timeout  | 15s (local) / 30s (cloud) | 30s        |

For Neon's free tier, you may want to reduce `max: 10` in `lib/db-config.ts`.

## Database Scripts

### Migrate (Create Schema)

```bash
npm run db:migrate
```

Creates all tables, indexes, and extensions idempotently.

### Test Connection

```bash
npm run test:connection
```

Verifies connection and displays database info.

### Reset Database

```bash
npm run db:reset
```

⚠️ Deletes all data. Use with caution.

## Troubleshooting

### Connection Refused

- **Local**: `brew services start postgresql`
- **Cloud**: Verify DATABASE_URL is correct and project is active

### Authentication Failed

- Check username and password in DATABASE_URL
- For Neon: Use default role (e.g., `neondb_owner`)
- Check special characters are URL-encoded

### Tables Not Created

```bash
npm run db:migrate
```

### SSL/TLS Errors

- Most cloud databases require `?sslmode=require`
- The app automatically enables SSL for cloud providers
- For local: Set `DB_SSL=false`

### Slow Performance

- Check indexes exist: `npm run test:connection`
- Monitor in cloud provider dashboard
- Consider connection pool size
- For Neon free tier: auto-suspend may delay first request

### pgvector Not Available

- Neon supports pgvector (newer versions)
- If unavailable, embeddings stored as JSONB (auto-compatible)
- No code changes needed

## Vercel Deployment

If deploying to Vercel:

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variable in Vercel Settings:
   ```
   DATABASE_URL = postgresql://...
   ```
4. Deploy!

The app will automatically:

- Detect cloud database
- Enable SSL
- Configure connection pooling
- Run migrations on first request (if needed)

## Neon-Specific Features

### Branching

Neon allows creating database branches:

- Create a `dev` branch for development
- Keep `main` for production
- Full data copy included
- Free tier: up to 10 branches

```bash
# Switch to dev branch
DATABASE_URL=postgresql://user:pass@ep-cool-lab-xxxxx-dev.us-east-1.neon.tech/neondb?sslmode=require
```

### Autosuspend

Free tier databases auto-suspend after 5 minutes of inactivity:

- First request after suspend takes ~1 second
- Production workloads should use paid tier

### Scaling

Neon allows horizontal scaling:

- Compute size: Nano (free) to XL
- Storage: Flexible per database
- Read replicas: Available on paid plans

## Performance Tips

### Development

- Use Neon free tier with dev branch
- Keep `NODE_ENV=development`
- Connection pooling defaults work fine

### Production

- Upgrade Neon to paid tier
- Disable autosuspend
- Monitor connections in dashboard
- Use connection pooling proxy if needed
- Enable query logs for optimization

### Both

- Run migrations once after schema changes
- Use parameterized queries (automatic in app)
- Create indexes for frequently queried columns (done in migrations)
- Monitor slow queries in database logs

## Next Steps

1. ✅ Create Neon account (or use another provider)
2. ✅ Copy connection string to `DATABASE_URL`
3. ✅ Run `npm run db:migrate`
4. ✅ Run `npm run test:connection`
5. ✅ Run `npm run dev`
6. ✅ Test upload PDF feature
7. ✅ Deploy to Vercel when ready

## Resources

- **Neon**: https://neon.tech/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **pg Library**: https://node-postgres.com
- **Next.js**: https://nextjs.org/docs

## Support

For issues:

1. Check `.env.local` has correct DATABASE_URL
2. Run `npm run test:connection` for diagnostics
3. Check database provider's dashboard/logs
4. Verify network connectivity and firewall rules
