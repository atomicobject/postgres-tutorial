import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Simple query helper for raw SQL
export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

// For when you need the full result (row count, etc.)
export async function queryRaw(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

export default pool;
