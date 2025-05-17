import cron from 'node-cron';
import { config } from '../config';
import { checkAndNotify } from './notification/checker';

/**
 * Start the minute-by-minute scheduler in the configured timezone.
 */
export function startScheduler(): void {
  cron.schedule(config.cronExpr, checkAndNotify, { timezone: config.timeZone });
}
