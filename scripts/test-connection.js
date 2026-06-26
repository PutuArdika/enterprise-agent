#!/usr/bin/env node

/**
 * Database Connection Test Script
 *
 * Tests connection to:
 * - Local PostgreSQL
 * - Cloud PostgreSQL (Neon, RDS, Render, Railway, Supabase, etc.)
 *
 * Usage:
 *   npm run test:connection
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !match[1].startsWith("#")) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

/**
 * Detect if DATABASE_URL is a cloud provider
 */
function isCloudDatabase(url) {
  const cloudProviders = [
    "neon.tech",
    "rds.amazonaws.com",
    "postgres.render.com",
    "railway.app",
    "supabase.co",
    "heroku.com",
    "cloud.google.com",
    "azure.com",
    "digitalocean.com",
  ];
  return cloudProviders.some((provider) => url.includes(provider));
}

/**
 * Get client configuration
 */
function getClientConfig() {
  if (process.env.DATABASE_URL) {
    const config = {
      connectionString: process.env.DATABASE_URL,
    };

    // Add SSL for cloud databases
    if (isCloudDatabase(process.env.DATABASE_URL)) {
      config.ssl = { rejectUnauthorized: false };
    }

    return config;
  }

  // Fallback to individual parameters
  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "eka_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  };
}

console.log("🔍 Database Diagnostics\n");
console.log("Environment Check:");
console.log("✓ DATABASE_URL set:", !!process.env.DATABASE_URL);
console.log("✓ OPENAI_API_KEY set:", !!process.env.OPENAI_API_KEY);

if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  console.error(
    "\n❌ Database configuration not found. Please check .env.local",
  );
  process.exit(1);
}

console.log("\n📡 Connection Details:");
try {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    const isCloud = isCloudDatabase(process.env.DATABASE_URL);
    console.log("✓ Type:", isCloud ? "Cloud PostgreSQL" : "Local PostgreSQL");
    console.log("✓ Host:", url.hostname);
    console.log("✓ Port:", url.port || 5432);
    console.log("✓ Database:", url.pathname.substring(1));
    console.log("✓ User:", url.username);
    console.log(
      "✓ SSL:",
      url.searchParams.get("sslmode") === "require" ? "Yes" : "No",
    );
  } else {
    const config = getClientConfig();
    console.log("✓ Type: Local PostgreSQL");
    console.log("✓ Host:", config.host);
    console.log("✓ Port:", config.port);
    console.log("✓ Database:", config.database);
    console.log("✓ User:", config.user);
  }
} catch (err) {
  console.log("⚠️  Could not parse connection details");
}

console.log("\n⏳ Testing connection...");

const clientConfig = getClientConfig();
const client = new Client({
  ...clientConfig,
  connectionTimeoutMillis: 30000,
  statement_timeout: 30000,
});

async function test() {
  try {
    console.log("   Connecting...");
    await client.connect();
    console.log("   ✅ Connected successfully!\n");

    // Get server version
    const versionResult = await client.query("SELECT version()");
    const version = versionResult.rows[0].version;
    console.log("📊 Database Version:");
    console.log(`   ${version.split(",")[0]}\n`);

    // Check pgvector extension
    console.log("🔧 Checking Extensions:");
    const extResult = await client.query(
      "SELECT extname FROM pg_extension ORDER BY extname",
    );

    if (extResult.rows.length === 0) {
      console.log("   ⚠️  No extensions installed");
    } else {
      extResult.rows.forEach((ext) => {
        const icon = ext.extname === "vector" ? "✓" : "•";
        console.log(`   ${icon} ${ext.extname}`);
      });
    }

    if (!extResult.rows.some((e) => e.extname === "vector")) {
      console.log("\n   ℹ️  Installing pgvector extension...");
      try {
        await client.query("CREATE EXTENSION IF NOT EXISTS vector");
        console.log("   ✅ pgvector installed");
      } catch (err) {
        console.log(
          "   ⚠️  pgvector not available (embeddings stored as JSON)",
        );
      }
    } else {
      console.log("   ✅ pgvector available");
    }

    // Check tables
    console.log("\n📋 Database Tables:");
    const tableResult = await client.query(`
      SELECT 
        tablename,
        (SELECT count(*) FROM information_schema.columns WHERE table_name = tablename) as column_count
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    if (tableResult.rows.length === 0) {
      console.log("   ⚠️  No tables found");
      console.log("\n   → Run: npm run db:migrate");
    } else {
      tableResult.rows.forEach((row) => {
        console.log(`   ✓ ${row.tablename} (${row.column_count} columns)`);
      });
      console.log("\n   ✅ All required tables exist");
    }

    // Check indexes
    console.log("\n🔑 Indexes:");
    const indexResult = await client.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    if (indexResult.rows.length === 0) {
      console.log("   ⚠️  No indexes found");
    } else {
      const grouped = {};
      indexResult.rows.forEach((idx) => {
        if (!grouped[idx.tablename]) {
          grouped[idx.tablename] = [];
        }
        grouped[idx.tablename].push(idx.indexname);
      });
      Object.entries(grouped).forEach(([table, indexes]) => {
        console.log(`   ${table}: ${indexes.length} indexes`);
      });
    }

    console.log("\n✅ Database diagnostics complete!");
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Connection failed:", err.message);
    console.error("\nTroubleshooting:\n");

    if (err.message.includes("ECONNREFUSED")) {
      console.error("• PostgreSQL server is not running");
      console.error("• For local: brew services start postgresql");
      console.error("• For cloud: Check Neon project is active");
    } else if (err.message.includes("ENOTFOUND")) {
      console.error("• Cannot resolve hostname");
      console.error("• Check DATABASE_URL is correct");
      console.error("• Verify internet connectivity");
    } else if (err.message.includes("password")) {
      console.error("• Authentication failed");
      console.error("• Verify username and password in DATABASE_URL");
    } else if (err.message.includes("does not exist")) {
      console.error("• Database or role does not exist");
      console.error("• Check database name in DATABASE_URL");
    } else {
      console.error("• Check DATABASE_URL in .env.local");
      console.error(
        "• For Neon: Format is postgresql://user:pass@host/db?sslmode=require",
      );
    }

    console.error("\nFor more help: npm run db:migrate\n");
    process.exit(1);
  }
}

test();
