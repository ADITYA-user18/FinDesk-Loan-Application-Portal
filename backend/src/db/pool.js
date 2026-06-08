// ============================================================
// db/pool.js — PostgreSQL connection pool
// Uses the pg library with a single DATABASE_URL env variable.
// Pool is reused across all requests for performance.
// SSL NOTE: Neon / Supabase / Render always require SSL.
//   We detect this from DATABASE_URL so the same code works
//   locally (no SSL) and on hosted DBs (SSL required).
// ============================================================

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// Detect whether the DB URL demands SSL (Neon, Supabase, Render all do)
const requiresSSL = process.env.DATABASE_URL?.includes('sslmode');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Always use SSL when the URL says so — works in both dev & prod
  ssl: requiresSSL ? { rejectUnauthorized: false } : false,
  // Connection pool settings for performance
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,  // raised to 5s for remote DBs
});

// Verify connection on startup
pool.on('connect', () => {
  console.log('[DB] New client connected to PostgreSQL pool.');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
  process.exit(-1);
});

module.exports = pool;
