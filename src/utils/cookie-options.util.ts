import { CookieOptions } from "express";

export const buildCookieOptions = (forClearing = false): CookieOptions => {
    const isProd = process.env.NODE_ENV === 'production';

    const baseOptions: CookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        ...(isProd && { domain: '.deltaanugrah.com' }),
    };

    if (forClearing) {
        return {
            ...baseOptions,
            maxAge: 0,
        };
    }

    return {
        ...baseOptions,
        maxAge: 60 * 60 * 1000,
    };
};
