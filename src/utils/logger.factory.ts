import { logger } from './logger';

/**
 * LoggerFactory
 *
 * Generates named logger instances for structured module-based logging.
 * Usage: const log = LoggerFactory.getLogger('UserController');
 */
export class LoggerFactory {
    /**
     * getLogger
     *
     * Creates a logger with contextual prefix (e.g. class or module name).
     * @param name Identifier name (e.g. 'UserController')
     * @returns Object with `info()` and `error()` log methods
     */
    static getLogger(name: string) {
        return {
            info: (msg: string) => logger.info(`[${name}] ${msg}`),
            error: (msg: string) => logger.error(`[${name}] ${msg}`)
        };
    }
}
