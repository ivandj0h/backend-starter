import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { RESPONSE_MESSAGES, STATUS_CODES } from '@/constants/response-constants';

const jwtSecret = process.env.JWT_SECRET_KEY || 'SuP3Rsecr3Token';

/**
 * Middleware untuk memverifikasi token JWT dan meng-attach user ke request
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
            message: RESPONSE_MESSAGES.ERROR,
            error: RESPONSE_MESSAGES.NO_TOKEN_PROVIDED,
        });
    }

    try {
        req.user = jwt.verify(token, jwtSecret);
        next();
    } catch (error) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
            message: RESPONSE_MESSAGES.ERROR,
            error: RESPONSE_MESSAGES.INVALID_TOKEN,
        });
    }
};
