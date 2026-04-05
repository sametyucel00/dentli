import { Platform } from 'react-native';

import type { DatabaseService } from '@/src/services/database-service.types';
import { databaseService as nativeDatabaseService } from '@/src/services/database-service.native';
import { databaseService as webDatabaseService } from '@/src/services/database-service.web';

export const databaseService: DatabaseService =
  Platform.OS === 'web' ? webDatabaseService : nativeDatabaseService;
