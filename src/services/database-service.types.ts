import type { SQLiteBindParams } from 'expo-sqlite';

export type QueryParams = SQLiteBindParams;
export type DatabaseRow = Record<string, unknown>;

export interface DatabaseService {
  initialize(): Promise<void>;
  reset(): Promise<void>;
  run(sql: string, params?: QueryParams): Promise<void>;
  getFirst<T>(sql: string, params?: QueryParams): Promise<T | null>;
  getAll<T>(sql: string, params?: QueryParams): Promise<T[]>;
  withTransaction<T>(operation: () => Promise<T>): Promise<T>;
  listColumns(tableName: string): Promise<string[]>;
}
