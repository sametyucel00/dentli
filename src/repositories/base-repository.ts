import { DatabaseService } from '@/src/services/database-service.types';

export abstract class BaseRepository {
  constructor(protected readonly database: DatabaseService) {}
}
