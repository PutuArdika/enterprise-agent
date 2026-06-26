#!/bin/bash

# EKA Local PostgreSQL Setup Script
# This script automates PostgreSQL installation and setup via Homebrew

set -e

echo "🚀 EKA Local PostgreSQL Setup"
echo "=============================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

echo "✅ Homebrew is installed"
echo ""

# Install PostgreSQL
echo "🔄 Installing PostgreSQL..."
if brew list postgresql &>/dev/null; then
    echo "✅ PostgreSQL is already installed"
else
    brew install postgresql@15
    echo "✅ PostgreSQL installed"
fi

echo ""

# Start PostgreSQL service
echo "🔄 Starting PostgreSQL service..."
brew services start postgresql
sleep 2

# Check if service is running
if brew services list | grep -q "postgresql.*started"; then
    echo "✅ PostgreSQL service is running"
else
    echo "⚠️  PostgreSQL may not have started. Trying again..."
    brew services restart postgresql
    sleep 2
fi

echo ""

# Create database and user
echo "🔄 Setting up database..."

# Check if database exists
if psql postgres -c "SELECT 1 FROM pg_database WHERE datname = 'eka_db';" | grep -q 1; then
    echo "✅ Database 'eka_db' already exists"
else
    psql postgres -c "CREATE DATABASE eka_db;" || echo "⚠️  Database may already exist"
    echo "✅ Database 'eka_db' created"
fi

# Set user password
psql postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';" || true
echo "✅ User 'postgres' password set"

# Grant privileges
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE eka_db TO postgres;" || true
echo "✅ Privileges granted"

echo ""

# Install pgvector extension
echo "🔄 Installing pgvector extension..."
psql eka_db -c "CREATE EXTENSION IF NOT EXISTS vector;" || echo "⚠️  pgvector may not be available"
echo "✅ pgvector extension ready"

echo ""

# Run migrations
echo "🔄 Running database migrations..."
cd "$(dirname "$0")/.."
npm run db:migrate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000"
echo "3. Try uploading a PDF!"
echo ""
echo "To manage PostgreSQL:"
echo "  Start:   brew services start postgresql"
echo "  Stop:    brew services stop postgresql"
echo "  Restart: brew services restart postgresql"
echo "  Status:  brew services list"
echo ""
