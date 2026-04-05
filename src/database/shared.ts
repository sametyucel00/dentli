import { migrations } from '@/src/database/migrations';

export const DATABASE_NAME = 'dentli.db';
export const DATABASE_MIGRATIONS = migrations;

export function createMigrationTableStatement() {
  return `
    CREATE TABLE IF NOT EXISTS __migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `;
}
