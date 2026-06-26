/**
 * Database Migration Script
 *
 * Supports:
 * - Local PostgreSQL
 * - Cloud PostgreSQL (Neon, RDS, Render, Railway, Supabase, etc.)
 *
 * Usage:
 *   npm run db:migrate
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
      console.log(
        `   SSL: ${url.searchParams.get("sslmode") === "require" ? "Yes" : "No"}`,
      );
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

async function runMigrations() {
  const clientConfig = getClientConfig();

  const client = new Client({
    ...clientConfig,
    // Timeouts work for both local and cloud
    statement_timeout: 30000,
    query_timeout: 30000,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });

  try {
    console.log("🔄 Connecting to database...\n");
    logConnectionInfo(clientConfig);

    await client.connect();
    console.log("\n✅ Connected to database\n");

    // Read and execute migration file
    const migrationPath = path.join(
      __dirname,
      "../migrations/001_init_schema.sql",
    );

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const sql = fs.readFileSync(migrationPath, "utf-8");

    console.log("🔧 Executing migration...\n");

    // Split SQL by semicolon and execute each statement
    const statements = sql
      .split(";")
      .map((s) =>
        s
          .split("\n")
          .filter((line) => !line.trim().startsWith("--"))
          .join("\n")
          .trim(),
      )
      .filter((s) => s.length > 0);

    console.log(`📊 Found ${statements.length} SQL statements\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log(
          `   ✅ ${statement.substring(0, 60).replace(/\n/g, " ")}...`,
        );
        successCount++;
      } catch (err) {
        // Ignore duplicate table/extension/index errors (idempotent)
        if (
          err.message.includes("already exists") ||
          err.message.includes("already installed") ||
          err.message.includes("duplicate key") ||
          err.code === "42P07" || // duplicate table
          err.code === "42710" || // duplicate index
          err.code === "42601" // duplicate aggregate
        ) {
          console.log(
            `   ⏭️  Already exists: ${statement.substring(0, 55).replace(/\n/g, " ")}...`,
          );
          skipCount++;
        } else {
          console.error(`\n❌ Error executing: ${statement.substring(0, 100)}`);
          throw err;
        }
      }
    }

    console.log(
      `\n✅ Migration completed: ${successCount} executed, ${skipCount} skipped\n`,
    );

    // Verify tables
    const result = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('documents', 'document_chunks', 'chat_history', 'statistics')
      ORDER BY tablename
    `);

    if (result.rows.length === 0) {
      console.warn("⚠️  No tables found. Migration may have failed.\n");
    } else {
      console.log("📋 Created/Updated tables:");
      result.rows.forEach((row) => {
        console.log(`   ✓ ${row.tablename}`);
      });
      console.log();
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log("✅ Database connection closed\n");
  }
}

// Run migrations
runMigrations();
