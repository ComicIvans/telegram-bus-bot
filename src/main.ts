import { setupBot } from './bot';
import { initNotification } from './services/notification/init';
import { startScheduler } from './services/scheduler';
import { initDb } from './db';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  await initDb();

  const bot = setupBot();
  initNotification(bot.telegram);
  startScheduler();

  await bot.launch(() => logger.info('🤖 Bot initialized'));

  // Graceful shutdown
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch((err) => {
  logger.error('Fatal error in main(): %o', err);
  process.exit(1);
});
