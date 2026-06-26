#!/usr/bin/env node

/**
 * Database Reset Script
 *
 * ⚠️ WARNING: This script DELETES ALL DATA
 *
 * Supports:
 * - Local PostgreSQL
 * - Cloud PostgreSQL (Neon, RDS, Render, Railway, Supabase, etc.)
 *
 * Usage:
 *   npm run db:reset
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

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
 * Get client configuration from environment
 */
function getClientConfig() {
  if (process.env.DATABASE_URL) {
    const config = {
      connectionString: process.env.DATABASE_URL,
    };

    // Add SSL config for cloud databases
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

/**
 * Log connection information safely
 */
function logConnectionInfo(clientConfig) {
  try {
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      const isCloud = isCloudDatabase(process.env.DATABASE_URL);
      console.log(`   Type: ${isCloud ? "Cloud" : "Local"}`);
      console.log(`   Host: ${url.hostname}`);
      console.log(`   Database: ${url.pathname.substring(1)}`);
      console.log(`   User: ${url.username}`);
    } else {
      console.log(`   Type: Local`);
      console.log(`   Host: ${clientConfig.host}`);
      console.log(`   Port: ${clientConfig.port}`);
      console.log(`   Database: ${clientConfig.database}`);
      console.log(`   User: ${clientConfig.user}`);
    }
  } catch (err) {
    console.log("   Connection: Using DATABASE_URL");
  }
}

/**
 * Prompt user for confirmation
 */
async function confirmReset() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "\n⚠️  This will DELETE ALL DATA. Are you sure? (yes/no): ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "yes");
      },
    );
  });
}

async function resetDatabase() {
  const clientConfig = getClientConfig();

  console.log("🧹 Database Reset Script\n");
  console.log("⚠️  WARNING: This will DELETE ALL DATA\n");

  console.log("🔍 Database Info:");
  logConnectionInfo(clientConfig);

  // Confirm before proceeding
  const confirmed = await confirmReset();
  if (!confirmed) {
    console.log("\n❌ Reset cancelled.");
    process.exit(0);
  }

  const client = new Client({
    ...clientConfig,
    statement_timeout: 30000,
    query_timeout: 30000,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });

  try {
    console.log("\n🔄 Connecting to database...");
    await client.connect();
    console.log("✅ Connected\n");

    console.log("🧹 Truncating all tables...\n");

    // Tables to truncate (order matters due to foreign keys)
    const tables = [
      "chat_history",
      "document_chunks",
      "documents",
      "statistics",
    ];

    let successCount = 0;
    let skipCount = 0;

    for (const table of tables) {
      try {
        await client.query(`TRUNCATE TABLE ${table} CASCADE`);
        console.log(`   ✅ ${table}`);
        successCount++;
      } catch (err) {
        // Ignore table doesn't exist errors
        if (err.message.includes("does not exist")) {
          console.log(`   ⏭️  ${table} (doesn't exist)`);
          skipCount++;
        } else {
          console.error(`\n❌ Error truncating ${table}:`, err.message);
          throw err;
        }
      }
    }

    console.log(`\n✨ Database reset complete!`);
    console.log(
      `📊 Truncated: ${successCount} tables, Skipped: ${skipCount}\n`,
    );

    process.exit(0);
  } catch (err) {
    console.error("\n❌ Reset failed:", err.message);
    if (err.code) {
      console.error(`   Error Code: ${err.code}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase();
