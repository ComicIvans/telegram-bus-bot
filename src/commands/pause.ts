import dayjs from 'dayjs';
import { Context } from 'telegraf';
import { Subscription, DailyNotification } from '../db/models';

/** Pause all reminders for today by marking thresholds as sent */
export async function pauseHandler(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) return;

  const subs = await Subscription.findAll({
    where: { userId, active: true },
  });
  if (!subs.length) {
    return void (await ctx.reply(
      'No tienes suscripciones activas para pausar.',
    ));
  }

  const date = dayjs().format('YYYY-MM-DD');
  for (const sub of subs) {
    for (const th of [15, 10, 5]) {
      await DailyNotification.findOrCreate({
        where: { subscriptionId: sub.id, date, threshold: th },
        defaults: { subscriptionId: sub.id, date, threshold: th },
      });
    }
  }
  await ctx.reply('✅ Tus recordatorios se han pausado para hoy.');
}
