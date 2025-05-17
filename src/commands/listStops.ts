import { Context } from 'telegraf';
import { Stop } from '../db/models';

/** List all stops the user has queried at least once */
export async function listStopsHandler(ctx: Context): Promise<void> {
  const stops = await Stop.findAll();
  if (!stops.length) {
    return void (await ctx.reply('No tienes paradas guardadas.'));
  }
  const lines = stops
    .map(
      (s) =>
        `• ${s.id} – ${s.name} (líneas: ${JSON.parse(s.lines).join(', ')})`,
    )
    .join('\n');
  await ctx.reply(`📋 Paradas guardadas:\n\n${lines}`);
}
