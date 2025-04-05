// auth.service.impl.ts

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {IUser, IUserWithExtras} from '@/interfaces/user.interface';
import {AuthService} from './auth.service.interface';
import {LoggerFactory} from '@/utils/logger.factory';
import {RESPONSE_MESSAGES} from '@/constants/response-constants';
import {UserRepository} from "@/repositories/user.repository";

const jwtSecret = process.env.JWT_SECRET_KEY || 'SuP3Rsecr3Token';

export class AuthServiceImpl implements AuthService {
    private readonly logger = LoggerFactory.getLogger('AuthServiceImpl');

    /**
     * Mengautentikasi user dan menghasilkan token JWT
     * @param email Email user
     * @param password Password user
     * @returns Token JWT
     */
    async login(email: string, password: string): Promise<string> {
        const user = await UserRepository.findByEmail(email);

        if (!user) {
            throw new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
        }

        if (!user.is_active) {
            throw new Error(RESPONSE_MESSAGES.USER_INACTIVE);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash || '');
        if (!isPasswordValid) {
            throw new Error(RESPONSE_MESSAGES.INVALID_CREDENTIALS);
        }

        const userWithExtras = user as IUserWithExtras;
        return jwt.sign(
            {
                id: userWithExtras.id,
                email: userWithExtras.email,
                full_name: userWithExtras.full_name,
                phone: userWithExtras.phone,
                avatar: userWithExtras.avatar_url,
                role: {id: userWithExtras.role_id, name: userWithExtras.role_name},
                company: {id: userWithExtras.company_id, name: userWithExtras.company_name},
                department: {id: userWithExtras.department_id, name: userWithExtras.department_name},
                is_active: userWithExtras.is_active,
            },
            jwtSecret,
            {expiresIn: '1h'}
        );
    }

    /**
     * Mengambil user berdasarkan token JWT
     * @param token Token JWT
     * @returns Data user
     */
    async getUserFromToken(token: string): Promise<IUser | null> {
        try {
            const decoded = jwt.verify(token, jwtSecret) as { id: string };
            const user = await UserRepository.findById(decoded.id);

            return user || null;
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(`Failed to decode token: ${error.message}`);
            } else {
                this.logger.error('Unknown error occurred while decoding token');
            }
            return null;
        }
    }

}
