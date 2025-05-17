import { Telegraf, session, Scenes, Context } from 'telegraf';
import { replyStopInfo, stopWizard } from './commands/getStop';
import { subscribeWizard } from './commands/subscribe';
import { startHandler } from './commands/start';
import { pauseHandler } from './commands/pause';
import { listStopsHandler } from './commands/listStops';
import { config } from './config';
import { logger } from './utils/logger';
import { validateStopId, type TimeSlot } from './utils/validation';

const ALLOWED_USERNAMES = ['comic_ivans'];

/** Middleware: only owner may use the bot */
function allowedUsers(ctx: MyContext, next: () => Promise<void>) {
  if (!ctx.from || !ALLOWED_USERNAMES.includes(ctx.from.username ?? '')) {
    return ctx.reply('Lo siento, pero no te conozco.');
  }
  return next();
}

interface MySession extends Scenes.WizardSession {
  stopId?: string;
  line?: string;
  days?: string[];
  timeSlots?: TimeSlot[];
}

export interface MyContext extends Context {
  session: MySession;
  scene: Scenes.SceneContextScene<MyContext, Scenes.WizardSessionData>;
  wizard: Scenes.WizardContextWizard<MyContext>;
}

export function setupBot(): Telegraf<MyContext> {
  const bot = new Telegraf<MyContext>(config.telegramToken);
  const stage = new Scenes.Stage<MyContext>([stopWizard, subscribeWizard]);

  bot.use(session());
  bot.use(stage.middleware());
  bot.use(allowedUsers);

  // Logging
  bot.use((ctx, next) => {
    logger.info('Update received: %o', ctx.update);
    return next();
  });

  // Commands
  bot.start(startHandler);
  bot.help(startHandler);
  bot.command('parada', (ctx) => ctx.scene.enter('stop-wizard'));
  bot.command('misparadas', listStopsHandler);

  // Direct numeric as /1234
  bot.command(/^(\d+)$/, async (ctx) => {
    try {
      const stopId = validateStopId(ctx.match[1] ?? '');
      await replyStopInfo(ctx, stopId);
    } catch (error) {
      logger.error('Error processing stop command: %o', error);
      await ctx.reply(
        'Número de parada inválido. Por favor, inténtalo de nuevo.',
      );
    }
  });

  bot.command('suscribir', (ctx) => ctx.scene.enter('subscribe-wizard'));
  bot.command('pausar', pauseHandler);

  return bot;
}
