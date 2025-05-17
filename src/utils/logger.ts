import { createLogger, format, transports } from 'winston';
import { config } from '../config';

export const logger = createLogger({
  level: config.logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: 'telegram-bus-bot' },
  transports: [new transports.Console()],
});
