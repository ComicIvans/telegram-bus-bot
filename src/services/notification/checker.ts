import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Subscription, DailyNotification } from '../../db/models';
import { getNextBuses } from '../stopService';
import { sendNotification } from './sender';
import { config } from '../../config';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(config.timeZone);

/**
 * Every minute: check each active subscription,
 * filter by user-chosen days & timeslots, and threshold,
 * then send any pending alerts.
 */
export async function checkAndNotify(): Promise<void> {
  const now = dayjs();
  const todayAbbr = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][now.day()]!;
  const currentTime = now.format('HH:mm');
  const dateStr = now.format('YYYY-MM-DD');

  const subs = await Subscription.findAll({ where: { active: true } });
  for (const sub of subs) {
    const days: string[] = JSON.parse(sub.days);
    if (!days.includes(todayAbbr)) continue;

    const slots: { from: string; to: string }[] = JSON.parse(sub.timeSlots);
    const inSlot = slots.some(
      ({ from, to }) => currentTime >= from && currentTime <= to,
    );
    if (!inSlot) continue;

    const info = await getNextBuses(sub.stopId, sub.line);
    for (const bus of info.nextBuses) {
      for (const th of [15, 10, 5]) {
        if (bus.minutes !== th) continue;
        const exists = await DailyNotification.findOne({
          where: { subscriptionId: sub.id, date: dateStr, threshold: th },
        });
        if (exists) continue;

        const msg =
          `⏰ En ${th} minutos llega el autobús ${sub.line} ` +
          `a la parada ${sub.stopId} (${bus.arrival})`;
        await sendNotification(sub.chatId, msg);
        await DailyNotification.create({
          subscriptionId: sub.id,
          date: dateStr,
          threshold: th,
        });
      }
    }
  }
}
