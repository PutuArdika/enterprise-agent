/**
 * Database Configuration Module
 *
 * This module provides a unified database configuration that supports:
 * - Local PostgreSQL (for development)
 * - Cloud PostgreSQL (Neon, AWS RDS, Heroku, etc.)
 *
 * Configuration priority:
 * 1. DATABASE_URL environment variable (recommended for cloud)
 * 2. Individual DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 * 3. Defaults (localhost, port 5432, eka_db, postgres/current user)
 */

import os from "os";

export interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | object;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  statement_timeout?: number;
  query_timeout?: number;
}

export interface ConnectionInfo {
  type: "cloud" | "local";
  host: string;
  port: number;
  database: string;
  user: string;
  isSSLEnabled: boolean;
}

/**
 * Get database configuration from environment variables
 * Automatically detects cloud vs local based on DATABASE_URL format
 */
export function getDatabaseConfig(): DatabaseConfig {
  // Priority 1: Use DATABASE_URL if available (recommended for cloud)
  if (process.env.DATABASE_URL) {
    const config: DatabaseConfig = {
      connectionString: process.env.DATABASE_URL,
    };

    // Add SSL configuration for cloud databases
    // Cloud databases (Neon, RDS, etc.) typically require SSL
    if (
      process.env.DATABASE_URL.includes("neon.tech") ||
      process.env.DATABASE_URL.includes("rds.amazonaws.com") ||
      process.env.DATABASE_URL.includes("postgres.render.com") ||
      process.env.DATABASE_URL.includes("railway.app") ||
      process.env.DATABASE_URL.includes("supabase.co")
    ) {
      config.ssl = { rejectUnauthorized: false };
    }

    return config;
  }

  // Priority 2: Use individual environment variables (local or custom)
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "eka_db",
    user: process.env.DB_USER || os.userInfo().username || "postgres",
    password: process.env.DB_PASSWORD || "",
  };

  // Enable SSL if explicitly requested for local development
  if (process.env.DB_SSL === "true") {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

/**
 * Get connection pool configuration
 * Adjusts pool size based on environment
 */
export function getPoolConfig(): Partial<DatabaseConfig> {
  const isProduction = process.env.NODE_ENV === "production";
  const isNeon = process.env.DATABASE_URL?.includes("neon.tech") ?? false;
  const isCloud = !!process.env.DATABASE_URL;

  // Neon free tier: max ~10 connections to pooler shared across all clients.
  // Keep pool small to avoid "too many clients" errors.
  const maxConnections = isNeon ? 5 : isProduction ? 15 : 10;

  // Neon free tier cold-starts after 5 min idle (takes 2–5s to wake).
  // Use longer timeouts so the first query after idle doesn't fail.
  return {
    max: maxConnections,
    idleTimeoutMillis: isNeon ? 10000 : 30000,
    connectionTimeoutMillis: isNeon ? 15000 : isCloud ? 10000 : 5000,
    statement_timeout: isNeon ? 60000 : isCloud ? 30000 : 15000,
    query_timeout: isNeon ? 60000 : isCloud ? 30000 : 15000,
  };
}

/**
 * Extract connection information from DATABASE_URL
 * Useful for logging and debugging
 */
export function getConnectionInfo(): ConnectionInfo {
  try {
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      return {
        type: isCloudDatabase(process.env.DATABASE_URL) ? "cloud" : "local",
        host: url.hostname,
        port: parseInt(url.port || "5432", 10),
        database: url.pathname.substring(1),
        user: url.username,
        isSSLEnabled: url.searchParams.get("sslmode") === "require",
      };
    }

    // Fallback for individual parameters
    return {
      type: "local",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      database: process.env.DB_NAME || "eka_db",
      user: process.env.DB_USER || "postgres",
      isSSLEnabled: process.env.DB_SSL === "true",
    };
  } catch (error) {
    console.error("Failed to parse connection info:", error);
    return {
      type: "local",
      host: "unknown",
      port: 5432,
      database: "unknown",
      user: "unknown",
      isSSLEnabled: false,
    };
  }
}

/**
 * Check if the database URL is a cloud provider
 */
function isCloudDatabase(url: string): boolean {
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
 * Build complete database configuration
 * Combines base config with pool settings
 */
export function buildDatabaseConfig(): DatabaseConfig {
  return {
    ...getDatabaseConfig(),
    ...getPoolConfig(),
  };
}

/**
 * Validate database configuration
 * Returns error message if invalid, null if valid
 */
export function validateDatabaseConfig(): string | null {
  try {
    if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
      return "No database configuration found. Set DATABASE_URL or DB_HOST.";
    }

    const info = getConnectionInfo();

    if (!info.host || !info.database) {
      return "Invalid database configuration: missing host or database name.";
    }

    return null;
  } catch (error) {
    return `Database configuration validation error: ${error}`;
  }
}
