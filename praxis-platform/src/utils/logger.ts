/**
 * Logging utility for Praxis Platform
 */

import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';
const logFormat = process.env.LOG_FORMAT || 'json';

export const logger = pino({
  level: logLevel,
  transport: logFormat === 'pretty'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export default logger;
