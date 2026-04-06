import * as SQLite from 'expo-sqlite';

import {
  DATABASE_MIGRATIONS,
  DATABASE_NAME,
  createMigrationTableStatement,
} from '@/src/database/shared';
import {
  DatabaseRow,
  DatabaseService,
  QueryParams,
} from '@/src/services/database-service.types';

type DatabaseExecutor = Pick<
  SQLite.SQLiteDatabase,
  'runAsync' | 'getFirstAsync' | 'getAllAsync'
>;

type MigrationRow = {
  version: number;
};

type PragmaColumnRow = {
  name: string;
};

class NativeDatabaseService implements DatabaseService {
  private databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
  private initializationPromise: Promise<void> | null = null;
  private operationQueue = Promise.resolve();
  private activeExecutor: DatabaseExecutor | null = null;

  async initialize() {
    if (!this.initializationPromise) {
      this.initializationPromise = this.enqueue(async () => {
        const database = await this.getDatabase();

        await database.execAsync(`
          PRAGMA journal_mode = WAL;
          PRAGMA foreign_keys = ON;
        `);

        await database.execAsync(createMigrationTableStatement());

        for (const migration of DATABASE_MIGRATIONS) {
          const existing = await database.getFirstAsync<MigrationRow>(
            `SELECT version FROM __migrations WHERE version = ? LIMIT 1;`,
            [migration.version],
          );

          if (existing) continue;

          await database.withExclusiveTransactionAsync(async (transaction) => {
            for (const statement of migration.up) {
              await transaction.execAsync(statement);
            }

            await transaction.runAsync(
              `INSERT INTO __migrations (version, name, applied_at) VALUES (?, ?, datetime('now'));`,
              [migration.version, migration.name],
            );
          });
        }
      }).catch((error) => {
        this.initializationPromise = null;
        throw error;
      });
    }

    return this.initializationPromise;
  }

  async run(sql: string, params: QueryParams = []) {
    if (this.activeExecutor) {
      await this.activeExecutor.runAsync(sql, params);
      return;
    }

    await this.enqueue(async () => {
      const database = await this.getDatabase();
      await database.runAsync(sql, params);
    });
  }

  async getFirst<T>(sql: string, params: QueryParams = []) {
    if (this.activeExecutor) {
      return this.activeExecutor.getFirstAsync<T>(sql, params);
    }

    return this.enqueue(async () => {
      const database = await this.getDatabase();
      return database.getFirstAsync<T>(sql, params);
    });
  }

  async getAll<T>(sql: string, params: QueryParams = []) {
    if (this.activeExecutor) {
      return this.activeExecutor.getAllAsync<T>(sql, params);
    }

    return this.enqueue(async () => {
      const database = await this.getDatabase();
      return database.getAllAsync<T>(sql, params);
    });
  }

  async withTransaction<T>(operation: () => Promise<T>) {
    if (this.activeExecutor) {
      return operation();
    }

    return this.enqueue(async () => {
      const database = await this.getDatabase();
      let result: T | undefined;

      await database.withExclusiveTransactionAsync(async (transaction) => {
        const previousExecutor = this.activeExecutor;
        this.activeExecutor = transaction;

        try {
          result = await operation();
        } finally {
          this.activeExecutor = previousExecutor;
        }
      });

      return result as T;
    });
  }

  async listColumns(tableName: string) {
    const rows = await this.getAll<PragmaColumnRow & DatabaseRow>(
      `PRAGMA table_info(${tableName});`,
    );

    return rows.map((row) => row.name);
  }

  async reset() {
    await this.enqueue(async () => {
      const database = await this.getDatabase();
      await database.closeAsync();
      await SQLite.deleteDatabaseAsync(DATABASE_NAME);
      this.databasePromise = null;
      this.initializationPromise = null;
      this.activeExecutor = null;
    });
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const nextOperation = this.operationQueue.then(operation, operation);
    this.operationQueue = nextOperation.then(
      () => undefined,
      () => undefined,
    );
    return nextOperation;
  }

  private getDatabase() {
    if (!this.databasePromise) {
      this.databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
    }

    return this.databasePromise;
  }
}

export const databaseService = new NativeDatabaseService();
