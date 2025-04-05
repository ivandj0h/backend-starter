import { Request, Response } from 'express';
import {Controller} from '@/configs/decorators/controller.decorator';
import { GET, POST, PATCH, DELETE, PathParam, QueryParam } from '@/configs/decorators/route.decorator';
import { RESPONSE_MESSAGES, STATUS_CODES } from '@/constants/response-constants';
import { UserServiceImpl } from '@/services/users/user.service.impl';
import { LoggerFactory } from '@/utils/logger.factory';
import { ResponseEntity } from "@/utils/response-entity.util";
import {multerUpload} from "@/configs/multer/multer.config";
import {authMiddleware} from "@/middlewares/auth/auth.middleware";

/**
 * UserController
 *
 * Menangani permintaan terkait pengguna (users),
 * seperti mengambil daftar pengguna atau detail pengguna berdasarkan ID.
 */
@Controller('/users')
export class UserController {
    private readonly logger = LoggerFactory.getLogger('UserController');
    private readonly userService = new UserServiceImpl();

    /**
     * Menghandle request untuk mendapatkan semua user atau pencarian berdasarkan keyword.
     * @param search Optional search keyword dari query param
     * @param req
     * @param res
     * @returns Response yang berisi daftar user
     */
    @GET('/', [authMiddleware])
    async getAllUsers(
        @QueryParam('search') search?: string,
        req?: Request,
        res?: Response
    ): Promise<Response> {
        try {
            const users = await this.userService.getAllUsers(search);
            return ResponseEntity.ok(res!, RESPONSE_MESSAGES.USERS_FETCHED, users);
        } catch (error) {
            this.logger.error(`getAllUsers() failed: ${error}`);
            return ResponseEntity.error(res!, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Menghandle request untuk mendapatkan user berdasarkan ID.
     * @param id ID user dari path param
     * @param req
     * @param res
     * @returns Response yang berisi data user jika ditemukan
     */
    @GET('/:id', [authMiddleware])
    async getUserById(
        @PathParam('id') id: string,
        req?: Request,
        res?: Response
    ): Promise<Response> {
        try {
            const user = await this.userService.getUserById(id);
            if (!user) {
                return ResponseEntity.error(res!, RESPONSE_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
            }
            return ResponseEntity.ok(res!, RESPONSE_MESSAGES.USER_FETCHED, user);
        } catch (error) {
            this.logger.error(`getUserById() failed: ${error}`);
            return ResponseEntity.error(res!, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Menghandle request untuk membuat user baru.
     * @param req Request dari client
     * @param res Response dari server
     * @returns Response dengan data user yang baru dibuat
     */
    @POST('/', [authMiddleware])
    async createUser(
        req: Request,
        res: Response
    ): Promise<Response> {
        const { company_id, email, password_hash, full_name, role_id, department_id, avatar_url, phone, position, is_active } = req.body;

        try {
            const user = await this.userService.createUser({
                company_id,
                email,
                password_hash,
                full_name,
                role_id,
                department_id,
                avatar_url,
                phone,
                is_active
            });
            return ResponseEntity.created(res, RESPONSE_MESSAGES.USER_CREATED, user);
        } catch (error) {
            this.logger.error(`createUser() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Menghandle request untuk update user.
     * @param req Request dari client
     * @param res Response dari server
     * @param id ID user dari path param
     * @returns Response dengan data user yang terupdate
     */
    @PATCH('/:id', [authMiddleware])
    async updateUser(
        @PathParam('id') id: string,
        req: Request,
        res: Response
    ): Promise<Response> {
        const updates = req.body;

        try {
            const updatedUser = await this.userService.updateUser(id, updates);
            return ResponseEntity.updated(res, RESPONSE_MESSAGES.USER_UPDATED, updatedUser);
        } catch (error) {
            this.logger.error(`updateUser() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Menghandle request untuk update role user.
     * @param id ID user dari path param
     * @param req Request yang berisi role_id baru
     * @param res Response ke client
     * @returns Response dengan user yang sudah diperbarui
     */
    @PATCH('/:id/role', [authMiddleware])
    async updateUserRole(
        @PathParam('id') id: string,
        req: Request,
        res: Response
    ): Promise<Response> {
        const { role_id } = req.body;

        try {
            const updatedUser = await this.userService.updateRole(id, role_id);
            return ResponseEntity.updated(res, RESPONSE_MESSAGES.USER_UPDATED, updatedUser);
        } catch (error) {
            this.logger.error(`updateUserRole() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Menghandle request untuk update status aktif (is_active) user.
     * @param id ID user dari path param
     * @param req Request yang berisi status baru
     * @param res Response ke client
     * @returns Response dengan user yang sudah diperbarui
     */
    @PATCH('/:id/activation', [authMiddleware])
    async updateUserStatus(
        @PathParam('id') id: string,
        req: Request,
        res: Response
    ): Promise<Response> {
        const { is_active } = req.body;

        try {
            const updatedUser = await this.userService.updateIsActive(id, is_active);
            return ResponseEntity.updated(res, RESPONSE_MESSAGES.USER_UPDATED, updatedUser);
        } catch (error) {
            this.logger.error(`updateUserStatus() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Endpoint untuk memperbarui avatar pengguna.
     *
     * - Menunggu file gambar (JPEG/PNG) yang di-upload
     * - Memvalidasi file yang di-upload
     * - Mengupdate avatar pengguna dalam sistem
     *
     * Middleware yang diterapkan:
     * - multerUpload.single('file') -> Menghandle upload file
     * - authMiddleware -> Memverifikasi token dan memastikan user terautentikasi
     *
     * Response:
     * - 200 OK: Avatar berhasil diperbarui
     * - 400 Bad Request: Tidak ada file yang di-upload
     * - 500 Internal Server Error: Terjadi kesalahan saat memproses permintaan
     */
    @PATCH('/:id/avatar', [multerUpload.single('file'), authMiddleware])
    async updateAvatar(
        @PathParam('id') id: string,
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const file = req.file as Express.Multer.File;

            if (!file) {
                return ResponseEntity.error(res, 'No file uploaded', STATUS_CODES.BAD_REQUEST);
            }

            const updatedUser = await this.userService.updateAvatar(id, file);
            return ResponseEntity.updated(res, RESPONSE_MESSAGES.USER_UPDATED, updatedUser);
        } catch (error) {
            this.logger.error(`updateAvatar() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Menghandle request untuk update password user.
     * @param id ID user dari path param
     * @param req Request yang berisi oldPassword dan newPassword
     * @param res Response yang berisi status update password
     */
    @PATCH('/:id/password', [authMiddleware])
    async updatePassword(
        @PathParam('id') id: string,
        req: Request,
        res: Response
    ): Promise<Response> {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return ResponseEntity.error(res, 'Both old and new password are required', STATUS_CODES.BAD_REQUEST);
        }

        try {
            const updatedUser = await this.userService.updatePassword(id, oldPassword, newPassword);
            return ResponseEntity.updated(res, RESPONSE_MESSAGES.USER_UPDATED, updatedUser);
        } catch (error) {
            this.logger.error(`updatePassword() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Menghandle request untuk delete user.
     * @param id ID user dari path param
     * @param res
     * @returns Response dengan status sukses
     */
    @DELETE('/:id', [authMiddleware])
    async deleteUser(
        @PathParam('id') id: string,
        res: Response
    ): Promise<Response> {
        try {
            await this.userService.deleteUser(id);
            return ResponseEntity.deleted(res, RESPONSE_MESSAGES.USER_DELETED, null);
        } catch (error) {
            this.logger.error(`deleteUser() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
}
