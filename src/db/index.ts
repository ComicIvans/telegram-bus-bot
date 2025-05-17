import { sequelize } from './models';
import { logger } from '../utils/logger';

/** Initialize and sync the SQLite database */
export async function initDb(): Promise<void> {
  await sequelize.sync();
  logger.info('🗂️ Database initialized');
}
