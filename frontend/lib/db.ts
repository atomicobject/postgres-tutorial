import "server-only";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Simple query helper for raw SQL
export async function query<T = unknown>(text: string): Promise<T[]> {
  const result = await pool.query(text);
  return result.rows as T[];
}

export default pool;
