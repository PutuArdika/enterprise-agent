/**
 * Database Module with Cloud PostgreSQL Support
 *
 * This module provides a unified database interface that works with:
 * - Local PostgreSQL (for development)
 * - Cloud PostgreSQL: Neon, AWS RDS, Render, Railway, Supabase, etc.
 *
 * Configuration is automatic - set DATABASE_URL for cloud databases
 * or DB_HOST/DB_PORT/etc for local databases.
 */

import { Pool, QueryResult, PoolClient } from "pg";
import {
  buildDatabaseConfig,
  getConnectionInfo,
  validateDatabaseConfig,
} from "./db-config";

// Validate configuration on startup
const configError = validateDatabaseConfig();
if (configError && process.env.NODE_ENV !== "test") {
  console.error(`[DB] Configuration Error: ${configError}`);
}

// Create connection pool with proper configuration
const pool = new Pool(buildDatabaseConfig());

// Connection pool event handlers
pool.on("error", (err) => {
  console.error("[DB] Unexpected error on idle client:", err);
  process.exitCode = 1;
});

pool.on("connect", () => {
  if (process.env.NODE_ENV === "development") {
    console.log("[DB] New client connected");
  }
});

pool.on("remove", () => {
  if (process.env.NODE_ENV === "development") {
    console.log("[DB] Client removed from pool");
  }
});

// Log connection info on startup
if (process.env.NODE_ENV === "development") {
  const info = getConnectionInfo();
  console.log("[DB] Connected to:", {
    type: info.type,
    host: info.host,
    database: info.database,
    ssl: info.isSSLEnabled,
  });
}

/**
 * Execute a parameterized query
 * @param text - SQL query with $1, $2 placeholders
 * @param params - Query parameters
 * @returns Query result
 */
export async function query(
  text: string,
  params?: any[],
): Promise<QueryResult> {
  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === "development") {
      console.log("[DB] Query executed", {
        text: text.substring(0, 80),
        duration,
        rows: result.rowCount,
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    const errorMsg = error instanceof Error ? error.message : String(error);

    console.error("[DB] Query failed", {
      text: text.substring(0, 80),
      duration,
      error: errorMsg,
    });

    // Provide helpful guidance for common errors
    if (errorMsg.includes("does not exist")) {
      console.error(
        "\n[DB] HINT: Database object does not exist.\n" +
          "  - Ensure DATABASE_URL is set correctly\n" +
          "  - Run migrations: npm run db:migrate\n" +
          "  - Check database tables exist\n",
      );
    }

    throw error;
  }
}

/**
 * Get a client from the pool for manual transaction handling
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Execute multiple queries in a transaction
 */
export async function transaction(
  callback: (client: PoolClient) => Promise<any>,
): Promise<any> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[DB] Transaction rolled back:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get connection pool statistics
 */
export function getPoolStats() {
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingRequests: pool.waitingCount,
  };
}

/**
 * Close all connections and end pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
  console.log("[DB] Connection pool closed");
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("[DB] Closing connection pool on SIGINT...");
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("[DB] Closing connection pool on SIGTERM...");
  await closePool();
  process.exit(0);
});

export default pool;
