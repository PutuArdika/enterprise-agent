# 🚀 Local PostgreSQL Setup - Quick Start

Your EKA project is now configured to work with **local PostgreSQL** installed via Homebrew!

## ⚡ Quick Start (2 minutes)

### Option 1: Automatic Setup (Recommended)

```bash
cd /Users/putu_a/Downloads/eka-nextjs-prototype
npm run db:setup
```

This script will:

- ✅ Install PostgreSQL via Homebrew
- ✅ Create the `eka_db` database
- ✅ Install pgvector extension
- ✅ Run database migrations
- ✅ Verify tables

### Option 2: Manual Setup

**Step 1: Install PostgreSQL**

```bash
brew install postgresql@15
```

**Step 2: Start PostgreSQL**

```bash
brew services start postgresql
```

**Step 3: Create database**

```bash
psql postgres -c "CREATE DATABASE eka_db;"
```

**Step 4: Install pgvector**

```bash
psql eka_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

**Step 5: Run migrations**

```bash
npm run db:migrate
```

## 🎯 Next: Start Your App

```bash
npm run dev
```

Then open: **http://localhost:3000**

## 📁 Files Changed

✅ `.env.local` - Updated to use local PostgreSQL  
✅ `lib/db.ts` - Now supports local connections  
✅ `scripts/migrate.js` - Enhanced for local databases  
✅ `scripts/setup-postgres.sh` - NEW automatic setup script  
✅ `LOCAL_POSTGRES_SETUP.md` - Full detailed guide  
✅ `package.json` - Added `npm run db:setup` command

## ✨ Environment Configuration

Your `.env.local` now has:

```bash
DATABASE_URL=postgresql://localhost:5432/eka_db
DB_USER=postgres
DB_PASSWORD=postgres
```

Or you can use individual parameters:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eka_db
DB_USER=postgres
DB_PASSWORD=postgres
```

## 🔧 PostgreSQL Management

### Start PostgreSQL

```bash
brew services start postgresql
```

### Stop PostgreSQL

```bash
brew services stop postgresql
```

### Check Status

```bash
brew services list
```

### Connect to Database

```bash
psql eka_db
```

### View Tables

```bash
psql eka_db -c "\dt"
```

## ✅ Verify Setup

Test your connection:

```bash
npm run test:connection
```

Expected output:

```
✅ Connection to database successful
✅ pgvector extension is installed
✅ Tables exist
```

## 📚 Detailed Documentation

For full details, see: `LOCAL_POSTGRES_SETUP.md`

## 🚨 Troubleshooting

### PostgreSQL won't start

```bash
brew services restart postgresql
```

### Can't connect

Make sure PostgreSQL is running:

```bash
brew services list | grep postgresql
```

### Permission denied

Try with sudo:

```bash
sudo -u postgres psql eka_db
```

### pgvector not found

```bash
psql eka_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

## 📝 Database URL Format

- **Local**: `postgresql://localhost:5432/eka_db`
- **Cloud (Neon)**: `postgresql://user:password@host/dbname?sslmode=require`
- **Cloud (AWS RDS)**: `postgresql://user:password@host:5432/dbname`

## 🎉 You're Ready!

1. ✅ Run `npm run dev`
2. ✅ Open http://localhost:3000
3. ✅ Upload a PDF
4. ✅ Ask questions!

## 💡 Tips

- PostgreSQL runs in the background after setup
- Database persists between restarts
- To reset database: `dropdb eka_db && createdb eka_db`
- To backup: `pg_dump eka_db > backup.sql`
- To restore: `psql eka_db < backup.sql`

---

**Happy coding! 🎉**
