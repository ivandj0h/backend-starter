import { IUser } from '@/interfaces/user.interface';

/**
 * AuthService Interface
 *
 * Menyediakan kontrak untuk semua operasi terkait autentikasi.
 */
export interface AuthService {
    /**
     * Mengautentikasi user dan menghasilkan token JWT.
     * @param email Email user
     * @param password Password user
     * @returns Token JWT
     */
    login(email: string, password: string): Promise<string>;

    /**
     * Mengambil user berdasarkan token JWT yang sudah diverifikasi.
     * @param token Token JWT
     * @returns Data user
     */
    getUserFromToken(token: string): Promise<IUser | null>;
}