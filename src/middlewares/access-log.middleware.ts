import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

/**
 * Access Log Middleware
 *
 * Logs every incoming HTTP request method and URL.
 */
export function accessLogMiddleware(req: Request, res: Response, next: NextFunction) {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
}
