// Lightweight PG client wrapper
// Reads configuration from either DATABASE_URL or PG* env vars

const { Pool } = require('pg');

function createPool() {
  // Prefer DATABASE_URL; fallback to discrete vars
  const { DATABASE_URL, PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT } = process.env;
  /** @type {import('pg').PoolConfig} */
  const cfg = DATABASE_URL
    ? { connectionString: DATABASE_URL }
    : {
        host: PGHOST || 'localhost',
        user: PGUSER || 'postgres',
        password: PGPASSWORD || undefined,
        database: PGDATABASE || 'todo',
        port: PGPORT ? Number(PGPORT) : 5432,
      };

  // Optional: allow SSL via env
  if (process.env.PGSSL === '1' || process.env.PGSSLMODE === 'require') {
    cfg.ssl = { rejectUnauthorized: false };
  }

  const pool = new Pool(cfg);
  pool.on('error', (err) => {
    console.error('PG pool error', err);
  });
  return pool;
}

const pool = createPool();

async function ensureSchema() {
  // Create todos table if it does not exist
  const sql = `
  CREATE TABLE IF NOT EXISTS public.todos (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos (created_at DESC);
  `;
  await pool.query(sql);
}

async function query(sql, params) {
  return pool.query(sql, params);
}

module.exports = { pool, query, ensureSchema };

