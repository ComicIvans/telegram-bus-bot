import 'dotenv/config';

export const config = {
  telegramToken: process.env.TG_TOKEN!,
  logLevel: process.env.LOG_LEVEL || 'info',
  url: process.env.URL!,
  cronExpr: '* * * * *', // every minute
  timeZone: 'Europe/Madrid' as const,
};
