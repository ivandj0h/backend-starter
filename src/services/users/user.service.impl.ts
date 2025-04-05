import {IUser} from '@/interfaces/user.interface';
import {UserRepository} from '@/repositories/user.repository';
import {UserService} from './user.service.interface';
import {LoggerFactory} from '@/utils/logger.factory';
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcryptjs';
import {uploadToS3} from "@/utils/vendors/s3.util";
import {RESPONSE_MESSAGES} from "@/constants/response-constants";

/**
 * UserServiceImpl
 *
 * Implementasi dari UserService interface.
 * Mengelola logika bisnis terkait user seperti pencarian dan detail pengguna.
 */
export class UserServiceImpl implements UserService {
    private readonly logger = LoggerFactory.getLogger('UserServiceImpl');

    /**
     * Mengambil semua user atau mencari berdasarkan keyword jika tersedia.
     * @param keyword Kata kunci untuk pencarian (opsional)
     * @returns Daftar user yang sesuai
     */
    async getAllUsers(keyword?: string): Promise<IUser[]> {
        this.logger.info('getAllUsers() called');
        return UserRepository.findAll(keyword);
    }

    /**
     * Mengambil user berdasarkan ID.
     * @param id UUID dari user
     * @returns Object user jika ditemukan, otherwise undefined
     */
    async getUserById(id: string): Promise<IUser | undefined> {
        this.logger.info(`getUserById() called with id: ${id}`);
        return UserRepository.findById(id);
    }

    /**
     * Membuat user baru
     * @param userData Data user yang akan dimasukkan
     * @returns Data user yang baru dibuat
     */
    async createUser(userData: {
        company_id: string;
        email: string;
        password_hash: string | null;
        full_name: string | null;
        role_id: string;
        department_id: string;
        avatar_url: string | null;
        phone: string | null;
        is_active: boolean;
    }): Promise<IUser> {
        try {

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password_hash!, salt);
            const id = uuidv4();
            const created_at = new Date().toISOString();
            const updated_at = created_at;

            // Create the user object with all necessary properties
            const user: IUser = {
                id,
                company_id: userData.company_id,
                email: userData.email,
                password_hash: hashedPassword,
                full_name: userData.full_name,
                role_id: userData.role_id,  // Using role_id
                department_id: userData.department_id,  // Using department_id
                avatar_url: userData.avatar_url,
                phone: userData.phone,
                is_active: userData.is_active,
                created_at,
                updated_at,
            };

            // Insert the user into the database using the repository
            return await UserRepository.createUser(user);
        } catch (error) {
            console.error(`Error creating user: ${error}`);
            throw new Error('Error creating user');
        }
    }

    /**
     * Update user (company_id, department_id, email, full_name, phone)
     * @param id ID user yang akan diupdate
     * @param updates Data yang akan diupdate
     * @returns User yang sudah diperbarui tanpa password_hash
     */
    async updateUser(id: string, updates: {
        company_id?: string,
        department_id?: string,
        email?: string,
        full_name?: string,
        phone?: string
    }): Promise<IUser> {
        try {
            const updatedUser = await UserRepository.updateUser(id, updates);

            delete (updatedUser as any).password_hash;
            return updatedUser;
        } catch (error) {
            console.error(`Error updating user: ${error}`);
            throw new Error('Error updating user');
        }
    }

    /**
     * Update role_id user
     */
    async updateRole(id: string, role_id: string): Promise<IUser> {
        try {
            const roleExists = await UserRepository.checkRoleExists(role_id);
            if (!roleExists) {
                throw new Error('Role not found');
            }

            const updatedUser = await UserRepository.updateRole(id, role_id);
            delete (updatedUser as any).password_hash;
            return updatedUser;
        } catch (error) {
            console.error(`Error updating user role: ${error}`);
            throw new Error('Error updating user role');
        }
    }


    /**
     * Update status is_active user
     */
    async updateIsActive(id: string, is_active: boolean): Promise<IUser> {
        try {
            const updatedUser = await UserRepository.updateIsActive(id, is_active);
            delete (updatedUser as any).password_hash;
            return updatedUser;
        } catch (error) {
            console.error(`Error updating user status: ${error}`);
            throw new Error('Error updating user status');
        }
    }

    /**
     * Upload avatar user ke S3 lalu simpan URL-nya ke database
     */
    async updateAvatar(id: string, file: Express.Multer.File): Promise<IUser> {
        try {
            const url = await uploadToS3(file.buffer, file.originalname);

            if (!url) {
                this.logger.error('S3 upload failed or returned empty URL');
                throw new Error('Failed to upload avatar to S3');
            }

            const updatedUser = await UserRepository.updateAvatarUrl(id, url);
            delete (updatedUser as any).password_hash;
            return updatedUser;
        } catch (error) {
            this.logger.error(`updateAvatar() failed: ${error}`);
            throw new Error('Error updating avatar');
        }
    }

    /**
     * Update password user berdasarkan id user.
     * @param id ID user yang akan diupdate passwordnya
     * @param oldPassword Password lama yang dikirim oleh user
     * @param newPassword Password baru yang akan diubah
     * @returns User yang sudah terupdate
     */
    async updatePassword(id: string, oldPassword: string, newPassword: string): Promise<IUser> {
        const passwordHash = await UserRepository.findPasswordById(id);
        if (!passwordHash) {
            throw new Error(RESPONSE_MESSAGES.USER_NOT_FOUND);
        }

        const isOldPasswordValid = await bcrypt.compare(oldPassword, passwordHash);

        if (!isOldPasswordValid) {
            throw new Error(RESPONSE_MESSAGES.INVALID_CREDENTIALS);
        }

        if (newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        return await UserRepository.updatePassword(id, newPasswordHash);
    }



    /**
     * Hapus user
     * @param id ID user
     */
    async deleteUser(id: string): Promise<void> {
        try {
            await UserRepository.deleteUser(id);
        } catch (error) {
            console.error(`Error deleting user: ${error}`);
            throw new Error('Error deleting user');
        }
    }
}
