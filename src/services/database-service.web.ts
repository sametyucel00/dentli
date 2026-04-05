import { DatabaseService, QueryParams } from '@/src/services/database-service.types';

class BrowserFallbackDatabaseService implements DatabaseService {
  private hasWarned = false;

  async initialize() {
    if (this.hasWarned) return;

    this.hasWarned = true;
    console.warn(
      '[Dentli] expo-sqlite is running in web fallback mode. Database operations are no-ops on web builds.',
    );
  }

  async run(_sql: string, _params: QueryParams = []) {}
  async getFirst<T>(_sql: string, _params: QueryParams = []) {
    return null as T | null;
  }
  async getAll<T>(_sql: string, _params: QueryParams = []) {
    return [] as T[];
  }
  async withTransaction<T>(operation: () => Promise<T>) {
    return operation();
  }
  async listColumns(_tableName: string) {
    return [] as string[];
  }
}

export const databaseService = new BrowserFallbackDatabaseService();
