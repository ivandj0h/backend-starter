import {CookieOptions, Response} from 'express';
import { ApiResponse } from './response.util';
import { STATUS_CODES } from '@/constants/response-constants';

/**
 * Utility class to mimic Spring Boot's ResponseEntity behavior.
 */
export class ResponseEntity {
    private static ensureResponse(res: Response): void {
        if (!res || typeof res.status !== 'function') {
            throw new Error('Response object is missing or invalid');
        }
    }

    /**
     * 200 OK Response
     */
    static ok<T>(
        res: Response,
        message: string,
        data: T | null = null,
        options?: {
            cookie?: { name: string; value: string; options?: CookieOptions },
            clearCookie?: { name: string; options?: CookieOptions }
        }
    ): Response {
        this.ensureResponse(res);

        if (options?.cookie) {
            res.cookie(options.cookie.name, options.cookie.value, options.cookie.options ?? {});
        }

        if (options?.clearCookie) {
            res.clearCookie(
                options.clearCookie.name,
                options.clearCookie.options ?? {}
            );
        }

        return res.status(STATUS_CODES.OK).json({
            status: 'success',
            message,
            data,
        } as ApiResponse<T>);
    }

    /**
     * 201 Created Response
     */
    static created<T>(res: Response, message: string, data: T | null = null): Response {
        this.ensureResponse(res);
        return res.status(STATUS_CODES.CREATED).json({
            status: 'success',
            message,
            data,
        } as ApiResponse<T>);
    }

    /**
     * 200 Updated Response
     */
    static updated<T>(res: Response, message: string, data: T | null = null): Response {
        this.ensureResponse(res);
        return res.status(STATUS_CODES.OK).json({
            status: 'success',
            message,
            data,
        } as ApiResponse<T>);
    }

    /**
     * 200 Deleted Response
     */
    static deleted<T>(res: Response, message: string, data: T | null = null): Response {
        this.ensureResponse(res);
        return res.status(STATUS_CODES.OK).json({
            status: 'success',
            message,
            data,
        } as ApiResponse<T>);
    }

    /**
     * Error Response (default: 500)
     */
    static error(
        res: Response,
        message: string,
        statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR,
        data: any = null
    ): Response {
        this.ensureResponse(res);
        const code = statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
        return res.status(code).json({
            status: 'error',
            message,
            data,
        });
    }

    /**
     * Custom Response with Headers
     */
    static withHeaders<T>(
        res: Response,
        statusCode: number,
        headers: Record<string, string>,
        body: ApiResponse<T>
    ): Response {
        this.ensureResponse(res);
        Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
        return res.status(statusCode).json(body);
    }
}