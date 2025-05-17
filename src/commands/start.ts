import { Context } from 'telegraf';

/** Show help and available commands */
export async function startHandler(ctx: Context): Promise<void> {
  await ctx.reply(
    `¡Hola caracola! 👋\n\n` +
      `Soy tu bot de horarios de autobuses.\n\n` +
      `Comandos disponibles:\n` +
      `/parada - Consultar los próximos autobuses en una parada\n` +
      `/misparadas - Ver lista de paradas consultadas\n` +
      `/suscribir - Recibir recordatorios personalizados\n` +
      `/pausar - Pausar recordatorios para hoy\n` +
      `/help - Mostrar esta ayuda\n`,
  );
}
