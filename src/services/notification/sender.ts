import { getTelegramClient } from './init';
import { logger } from '../../utils/logger';

/**
 * Send a notification message to a chat.
 * @param chatId – Telegram chat identifier
 * @param text – message in Spanish
 */
export async function sendNotification(
  chatId: number,
  text: string,
): Promise<void> {
  try {
    await getTelegramClient().sendMessage(chatId, text);
    logger.info('Notification sent to %d: %s', chatId, text);
  } catch (err) {
    logger.error('Error sending notification to %d: %o', chatId, err);
  }
}
