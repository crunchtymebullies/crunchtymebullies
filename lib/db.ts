// ═══════════════════════════════════════════════════════════
// CRUNCHTIME BULLIES — Neon PostgreSQL Database Client
// ═══════════════════════════════════════════════════════════

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || '';

export function getDb() {
  if (!DATABASE_URL) throw new Error('DATABASE_URL not set');
  return neon(DATABASE_URL);
}

// Helper: run a query and return rows
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const db = getDb();
  const rows = await db(sql, params);
  return rows as T[];
}

// Helper: run a query and return single row or null
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

// Helper: run an insert/update and return affected row
export async function execute(
  sql: string,
  params: unknown[] = []
): Promise<Record<string, unknown> | null> {
  const db = getDb();
  const rows = await db(sql, params);
  return (rows[0] as Record<string, unknown>) || null;
}
