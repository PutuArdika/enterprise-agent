# 🐘 Local PostgreSQL Setup Guide

This guide will help you set up a local PostgreSQL database for the EKA project using Homebrew on macOS.

## Prerequisites

- macOS
- Homebrew installed (if not: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`)

## Step 1: Install PostgreSQL via Homebrew

```bash
brew install postgresql@15
```

Or for the latest version:

```bash
brew install postgresql
```

## Step 2: Start PostgreSQL Service

Start PostgreSQL and have it run in the background:

```bash
brew services start postgresql
```

Verify it's running:

```bash
brew services list
```

You should see `postgresql` with a checkmark (✓).

## Step 3: Create Database and User

Open PostgreSQL interactive terminal:

```bash
psql postgres
```

Then run these SQL commands:

```sql
-- Create the database
CREATE DATABASE eka_db;

-- Create user (if needed) - postgres user usually exists
ALTER USER postgres WITH PASSWORD 'postgres';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE eka_db TO postgres;

-- Exit
\q
```

Verify the database was created:

```bash
psql postgres -l
```

You should see `eka_db` in the list.

## Step 4: Enable pgvector Extension

Connect to your database:

```bash
psql eka_db
```

Install pgvector:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
\dx
```

You should see `vector` in the extensions list. Then exit:

```sql
\q
```

## Step 5: Run Database Migration

Now run the migration script to create tables:

```bash
cd /Users/putu_a/Downloads/eka-nextjs-prototype
npm run db:migrate
```

Expected output:

```
✅ Database connected successfully
✅ Schema migration completed
✅ All tables created
```

Verify tables were created:

```bash
psql eka_db -c "\dt"
```

You should see:

- `documents`
- `document_chunks`
- `chat_history`
- `statistics`

## Step 6: Verify Connection in App

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000 and try uploading a PDF. You should see data being saved to the database.

## Troubleshooting

### PostgreSQL won't start

```bash
brew services restart postgresql
```

### Can't connect to database

Check if PostgreSQL is running:

```bash
brew services list
```

Start it if needed:

```bash
brew services start postgresql
```

### pgvector extension not found

Reinstall PostgreSQL with pgvector support:

```bash
brew uninstall postgresql
brew install postgresql
psql postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Permission denied errors

Make sure you have the correct username/password:

```bash
psql postgres -U postgres -W
```

(Password is: `postgres`)

### Can't create database

Try with sudo:

```bash
sudo -u postgres psql
```

Then run the SQL commands above.

## Common Commands

```bash
# Start PostgreSQL
brew services start postgresql

# Stop PostgreSQL
brew services stop postgresql

# Restart PostgreSQL
brew services restart postgresql

# Check status
brew services list

# Connect to database
psql eka_db

# List databases
psql postgres -l

# List tables
psql eka_db -c "\dt"

# Backup database
pg_dump eka_db > backup.sql

# Restore database
psql eka_db < backup.sql
```

## Environment Variables

Make sure `.env.local` has:

```bash
DATABASE_URL=postgresql://localhost:5432/eka_db
DB_USER=postgres
DB_PASSWORD=postgres
```

Or individual parameters:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eka_db
DB_USER=postgres
DB_PASSWORD=postgres
```

## Next Steps

Once set up:

1. ✅ Run `npm run dev`
2. ✅ Visit http://localhost:3000
3. ✅ Upload a PDF to test
4. ✅ Ask questions in the chat interface

Your local PostgreSQL is now ready! 🚀
