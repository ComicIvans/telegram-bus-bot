import { Scenes, Markup } from 'telegraf';
import { Subscription } from '../db/models';
import { fetchStopInfo } from '../services/stopService';
import { validateStopId, parseDays, parseTimeSlots } from '../utils/validation';
import type { MyContext } from '../bot';

/**
 * Wizard scene to subscribe a user to a bus line with custom filters.
 */
export const subscribeWizard = new Scenes.WizardScene<MyContext>(
  'subscribe-wizard',

  // Step 0: Ask for stop ID
  async (ctx) => {
    await ctx.reply('¿Número de parada para suscribirte?', Markup.forceReply());
    return ctx.wizard.next();
  },

  // Step 1: Validate stop ID and ask for line
  async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
      try {
        const stopId = validateStopId(ctx.message.text);
        const info = await fetchStopInfo(stopId);
        ctx.session.stopId = info.stopId;

        await ctx.reply(
          `Parada ${info.stopId} – ${info.stopName}\n¿Qué línea quieres monitorizar?`,
          Markup.forceReply(),
        );

        return ctx.wizard.next();
      } catch {
        await ctx.reply('Número de parada no válido.');
        return ctx.scene.leave();
      }
    } else {
      await ctx.reply('Respuesta no válida.');
      return ctx.scene.leave();
    }
  },

  // Step 2: Ask for line and then ask for days
  async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
      ctx.session.line = ctx.message.text.trim();

      await ctx.reply(
        '¿En qué días quieres recibir notificaciones? (L,M,X,J,V,S,D)',
        Markup.forceReply(),
      );
      return ctx.wizard.next();
    } else {
      await ctx.reply('Respuesta no válida.');
      return ctx.scene.leave();
    }
  },

  // Step 3: Validate days and ask for time slots
  async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
      try {
        const days = parseDays(ctx.message.text);
        ctx.session.days = days;

        await ctx.reply(
          'Ahora indica las franjas horarias (HH:MM-HH:MM,...)',
          Markup.forceReply(),
        );
        return ctx.wizard.next();
      } catch {
        await ctx.reply('Formato de días inválido.');
        return ctx.scene.leave();
      }
    } else {
      await ctx.reply('Respuesta no válida.');
      return ctx.scene.leave();
    }
  },

  // Step 4: Validate time slots and persist subscription
  async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
      try {
        const timeSlots = parseTimeSlots(ctx.message.text);
        ctx.session.timeSlots = timeSlots;

        const { stopId, line, days } = ctx.session;

        const subscription = await Subscription.create({
          userId: ctx.from!.id,
          chatId: ctx.chat!.id,
          stopId,
          line,
          days: JSON.stringify(days),
          timeSlots: JSON.stringify(timeSlots),
        });

        await ctx.reply(
          `✅ Suscripción creada:\n` +
            `• Parada: ${subscription.stopId}\n` +
            `• Línea: ${subscription.line}\n` +
            `• Días: ${days!.join(',')}\n` +
            `• Franjas: ${timeSlots
              .map((slot) => `${slot.from}-${slot.to}`)
              .join(',')}`,
        );

        return ctx.scene.leave();
      } catch {
        await ctx.reply('Formato de franjas inválido.');
        return ctx.scene.leave();
      }
    } else {
      await ctx.reply('Respuesta no válida.');
      return ctx.scene.leave();
    }
  },
);
