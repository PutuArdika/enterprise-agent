/**
 * Enhanced Database Module with Cloud Support
 *
 * This module replaces lib/db.ts with better cloud database support.
 * It automatically detects and configures for:
 * - Local PostgreSQL
 * - Cloud PostgreSQL (Neon, RDS, Render, Railway, etc.)
 * - Handles SSL/TLS requirements
 * - Proper connection pooling
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

// Log connection info on startup (if not production or test)
if (process.env.NODE_ENV === "development") {
  const info = getConnectionInfo();
  console.log("[DB] Connection Details:", {
    type: info.type,
    host: info.host,
    port: info.port,
    database: info.database,
    user: info.user,
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
        text: text.substring(0, 100),
        duration,
        rows: result.rowCount,
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    const errorMsg = error instanceof Error ? error.message : String(error);

    console.error("[DB] Query failed", {
      text: text.substring(0, 100),
      duration,
      error: errorMsg,
    });

    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 * Ensures data consistency across multiple operations
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
 * Get pool statistics
 * Useful for monitoring and debugging
 */
export function getPoolStats() {
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingRequests: pool.waitingCount,
  };
}

/**
 * End all connections
 * Call this before app shutdown
 */
export async function closePool(): Promise<void> {
  await pool.end();
  console.log("[DB] Connection pool closed");
}

// Graceful shutdown on process termination
process.on("SIGINT", async () => {
  console.log("[DB] Received SIGINT, closing connections...");
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("[DB] Received SIGTERM, closing connections...");
  await closePool();
  process.exit(0);
});

export default { query, transaction, getPoolStats, closePool };
