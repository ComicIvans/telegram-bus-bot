// src/commands/getStop.ts

import { Scenes, Markup } from 'telegraf';
import * as stopService from '../services/stopService';
import { validateStopId } from '../utils/validation';
import { logger } from '../utils/logger';
import type { MyContext } from '../bot';

/**
 * Reply with next-bus information for a given stop ID.
 * @param ctx - Telegraf context
 * @param raw - Raw input string with stop ID
 */
export async function replyStopInfo(
  ctx: MyContext,
  stopId: string,
): Promise<void> {
  logger.info('Fetching stop info for stopId=%s', stopId);

  try {
    const info = await stopService.fetchStopInfo(stopId);
    if (!info.nextBuses.length) {
      await ctx.reply(`No hay salidas para la parada ${stopId}.`);
      return;
    }

    const lines = info.nextBuses
      .map(
        (b) =>
          `🚌 Línea ${b.line} → ${b.destination}\n⏳ ${b.minutes} min – ${b.arrival}`,
      )
      .join('\n\n');

    const message = `🚏 Parada ${info.stopId}\n📍 ${info.stopName}\n\n${lines}`;
    await ctx.reply(message);
  } catch (error) {
    logger.error('Failed to fetch stop info for %s: %o', stopId, error);
    await ctx.reply(
      'Lo siento, ha ocurrido un error al consultar la parada. Intenta de nuevo más tarde.',
    );
  }
}

/**
 * Wizard scene to request and validate a bus stop ID from the user.
 */
export const stopWizard = new Scenes.WizardScene<MyContext>(
  'stop-wizard',

  // Step 0: Ask for stop ID
  async (ctx) => {
    await ctx.reply('¿Cuál es el número de la parada?', Markup.forceReply());
    return ctx.wizard.next();
  },

  // Step 1: Validate stop ID and show info
  async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
      try {
        const stopId = validateStopId(ctx.message.text);
        await replyStopInfo(ctx, stopId);
        return ctx.scene.leave();
      } catch {
        await ctx.reply('Número de parada no válido.');
        return ctx.scene.leave();
      }
    } else {
      await ctx.reply('Respuesta no válida.');
      return ctx.scene.leave();
    }
  },
);
