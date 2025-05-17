import type { Telegram } from 'telegraf';
import { logger } from '../../utils/logger';

/** Shared Telegram client for notifications */
let tgClient: Telegram;

/**
 * Initialize notification service with bot telegram client.
 * Must be called before sending or checking notifications.
 */
export function initNotification(client: Telegram): void {
  tgClient = client;
  logger.info('📨 Notification service initialized');
}

export function getTelegramClient(): Telegram {
  if (!tgClient) {
    throw new Error('Notification service not initialized');
  }
  return tgClient;
}
