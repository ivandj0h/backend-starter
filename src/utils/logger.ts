import { createLogger, format, transports } from 'winston';

/**
 * Logger Instance
 *
 * Global logger using Winston.
 * Prints formatted logs to the console.
 * Format: [YYYY-MM-DD HH:mm:ss] LEVEL: message
 */
export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [new transports.Console()]
});
