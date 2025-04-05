import { Request, Response } from 'express';
import { Controller } from '@/configs/decorators/controller.decorator';
import { POST, GET } from '@/configs/decorators/route.decorator';
import { AuthServiceImpl } from '@/services/auth/auth.service.impl';
import { ResponseEntity } from '@/utils/response-entity.util';
import { LoggerFactory } from '@/utils/logger.factory';
import { RESPONSE_MESSAGES, STATUS_CODES } from '@/constants/response-constants';
import {buildCookieOptions} from "@/utils/cookie-options.util";

/**
 * AuthController
 *
 * Menangani permintaan terkait login dan autentikasi.
 */
@Controller('/auth')
export class AuthController {
    private readonly logger = LoggerFactory.getLogger('AuthController');
    private readonly authService = new AuthServiceImpl();

    /**
     * Login user dan kirim JWT via cookie.
     * @param req Request dari client
     * @param res Response dari server
     */
    @POST('/login')
    async login(req: Request, res: Response): Promise<Response> {
        const { email, password } = req.body;

        try {
            this.logger.info(`Login process started for email: ${email}`);
            const token = await this.authService.login(email, password);

            // Gunakan ResponseEntity untuk inject cookie
            return ResponseEntity.ok(
                res,
                RESPONSE_MESSAGES.USER_LOGGED_IN,
                { token },
                {
                    cookie: {
                        name: 'auth_token',
                        value: token,
                        options: buildCookieOptions(),
                    },
                }
            );
        } catch (error: unknown) {
            if (error instanceof Error) {
                return ResponseEntity.error(
                    res,
                    error.message || 'Authentication failed',
                    STATUS_CODES.UNAUTHORIZED
                );
            }

            return ResponseEntity.error(
                res,
                'Authentication failed',
                STATUS_CODES.UNAUTHORIZED
            );
        }
    }

    /**
     * Fetch profile user dari JWT token.
     * @param req Request dari client
     * @param res Response dari server
     */
    @GET('/profile')
    async getProfile(req: Request, res: Response): Promise<Response> {
        const user = req.user;

        if (!user) {
            this.logger.error('No user found in request');
            return ResponseEntity.error(res, 'User not found in request', STATUS_CODES.NOT_FOUND);
        }

        return ResponseEntity.ok(res, RESPONSE_MESSAGES.PROFILE_FETCHED, user);
    }

    /**
     * Logout user dengan menghapus cookie JWT.
     * @param _req
     * @param res Response dari server
     */
    @POST('/logout')
    async logout(_req: Request, res: Response): Promise<Response> {
        try {
            return ResponseEntity.ok(res, RESPONSE_MESSAGES.USER_LOGGED_OUT, null, {
                clearCookie: {
                    name: 'auth_token',
                    options: buildCookieOptions(true),
                },
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                return ResponseEntity.error(
                    res,
                    error.message || 'Logout failed',
                    STATUS_CODES.INTERNAL_SERVER_ERROR
                );
            }

            return ResponseEntity.error(
                res,
                'Logout failed',
                STATUS_CODES.INTERNAL_SERVER_ERROR
            );
        }
    }
}
