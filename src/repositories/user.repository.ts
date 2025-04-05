import {IUser} from '@/interfaces/user.interface';
import pool, {queryWithRetry} from '@/configs/supabase/database';

/**
 * UserRepository
 *
 * Bertanggung jawab untuk mengakses data user di database.
 */
export class UserRepository {
    /**
     * Ambil semua user dari database atau cari berdasarkan keyword.
     * @param keyword Kata kunci untuk pencarian (opsional)
     * @param column
     * @returns Daftar user
     */
    static async findAll(keyword?: string, column?: string): Promise<IUser[]> {
        let query = `
    SELECT u.id, u.company_id, u.email, u.full_name, u.role_id, u.department_id, 
           u.avatar_url, u.phone, u.is_active, u.created_at, u.updated_at, 
           r.name AS role_name, d.name AS department_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN departments d ON u.department_id = d.id
    `;
        const values: any[] = [];

        if (keyword) {
            if (column === 'full_name') {
                query += ' WHERE u.full_name ILIKE $1';
                values.push(`%${keyword}%`);
            } else if (column === 'email') {
                query += ' WHERE u.email ILIKE $1';
                values.push(`%${keyword}%`);
            } else {
                query += ' WHERE u.full_name ILIKE $1 OR u.email ILIKE $2';
                values.push(`%${keyword}%`, `%${keyword}%`);
            }
        }

        try {
            const users = await queryWithRetry(query, values);

            users.forEach(user => {
                delete user.password_hash;
            });

            return users;
        } catch (err) {
            console.error('Error fetching users:', err);
            throw new Error('Error fetching users');
        }
    }

    /**
     * Ambil user berdasarkan ID.
     * @param id UUID dari user
     * @returns User jika ditemukan
     */
    static async findById(id: string): Promise<IUser | undefined> {
        const query = `
    SELECT u.id, u.company_id, u.email, u.full_name, u.role_id, u.department_id, 
           u.avatar_url, u.phone, u.is_active, u.created_at, u.updated_at, 
           r.name AS role_name, d.name AS department_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN departments d ON u.department_id = d.id
    WHERE u.id = $1
    `;
        const values = [id];

        try {
            const result = await queryWithRetry(query, values);
            if (result[0]) {
                const user = result[0];
                delete user.password_hash;
                return user;
            }

            return undefined;
        } catch (err) {
            console.error('Error fetching user by ID:', err);
            throw new Error('Error fetching user by ID');
        }
    }

    /**
     * Membuat user baru
     * @param userData Data user yang akan dimasukkan
     * @returns Data user yang baru dibuat
     */
    static async createUser(userData: IUser): Promise<IUser> {
        const query = `
        INSERT INTO users (id, company_id, email, password_hash, full_name, role_id, department_id, avatar_url, phone, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *;
    `;
        const values = [
            userData.id,
            userData.company_id,
            userData.email,
            userData.password_hash,
            userData.full_name,
            userData.role_id,
            userData.department_id,
            userData.avatar_url,
            userData.phone,
            userData.is_active,
            userData.created_at,
            userData.updated_at
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (err) {
            console.error('Error inserting user:', err);
            throw new Error('Error inserting user into database');
        }
    }

    /**
     * Update user yang ada di database
     * @param id ID user
     * @param updates Data yang akan diupdate
     * @returns User yang sudah diperbarui
     */
    static async updateUser(id: string, updates: Partial<IUser>): Promise<IUser> {
        const fields = Object.keys(updates)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ');
        const query = `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
        const values = [id, ...Object.values(updates)];

        try {
            const result = await queryWithRetry(query, values);
            return result[0];
        } catch (err) {
            throw new Error('Error updating user');
        }
    }

    /**
     * Cek apakah role_id ada di database
     * @param role_id ID role yang ingin dicek
     * @returns true jika role_id ada
     */
    static async checkRoleExists(role_id: string): Promise<boolean> {
        const query = 'SELECT 1 FROM roles WHERE id = $1';
        const values = [role_id];

        try {
            const result = await queryWithRetry(query, values);
            return result.length > 0;
        } catch (err) {
            console.error('Error checking role existence:', err);
            throw new Error('Error checking role existence');
        }
    }

    /**
     * Update user role
     * @param id ID user
     * @param role_id ID role baru
     * @returns User yang sudah diperbarui
     */
    static async updateRole(id: string, role_id: string): Promise<IUser> {
        const query = 'UPDATE users SET role_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *';
        const values = [id, role_id];

        try {
            const result = await queryWithRetry(query, values);
            return result[0];
        } catch (err) {
            throw new Error('Error updating user role');
        }
    }

    /**
     * Update user status aktif
     * @param id ID user
     * @param is_active Status baru
     * @returns User yang sudah diperbarui
     */
    static async updateIsActive(id: string, is_active: boolean): Promise<IUser> {
        const query = 'UPDATE users SET is_active = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *';
        const values = [id, is_active];

        try {
            const result = await queryWithRetry(query, values);
            return result[0];
        } catch (err) {
            throw new Error('Error updating user status');
        }
    }

    /**
     * updateAvatarUrl
     *
     * Memperbarui URL avatar user berdasarkan ID dan menyimpan waktu pembaruan.
     * Method ini digunakan untuk mengganti URL avatar user yang sudah ada.
     *
     * @param id ID user yang avatar-nya ingin diperbarui
     * @param avatar_url URL avatar baru yang akan disimpan
     * @returns User yang sudah diperbarui dengan URL avatar yang baru
     */
    static async updateAvatarUrl(id: string, avatar_url: string): Promise<IUser> {
        const query = `
    UPDATE users 
    SET avatar_url = $2, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1 
    RETURNING *`;
        const values = [id, avatar_url];

        const result = await queryWithRetry(query, values);
        return result[0];
    }

    /**
     * findByEmail
     *
     * Mencari user berdasarkan email.
     * Method ini digunakan untuk mendapatkan user yang terdaftar di sistem berdasarkan alamat email yang diberikan.
     *
     * @param email Alamat email user yang ingin dicari
     * @returns User yang ditemukan berdasarkan email atau undefined jika tidak ada
     */
    static async findByEmail(email: string): Promise<IUser | undefined> {
        const query = `
        SELECT u.*, r.name AS role_name, c.name AS company_name, d.name AS department_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN companies c ON u.company_id = c.id
        JOIN departments d ON u.department_id = d.id
        WHERE u.email = $1
    `;
        const values = [email];

        try {
            const result = await queryWithRetry(query, values);
            return result[0] || undefined;
        } catch (err) {
            console.error('Error fetching user by email:', err);
            throw new Error('Error fetching user by email');
        }
    }

    /**
     * findPasswordById
     *
     * Mengambil password_hash berdasarkan id user dari database.
     * Method ini hanya digunakan untuk keperluan validasi password di proses login atau update password.
     *
     * @param id ID user yang ingin diambil password_hash-nya
     * @returns password_hash jika ditemukan, atau null jika tidak ditemukan
     * @throws Error jika terjadi kesalahan saat mengambil data dari database
     */
    static async findPasswordById(id: string): Promise<string | null> {
        const query = 'SELECT password_hash FROM users WHERE id = $1';
        const values = [id];

        try {
            const result = await queryWithRetry(query, values);
            return result[0]?.password_hash || null;
        } catch (err) {
            console.error('Error fetching password by id:', err);
            throw new Error('Error fetching password by id');
        }
    }

    /**
     * Update password user di database
     * @param id ID user yang password-nya ingin diubah
     * @param newPasswordHash Password baru yang sudah terenkripsi
     * @returns User yang terupdate
     */
    static async updatePassword(id: string, newPasswordHash: string): Promise<IUser> {
        const query = `
            UPDATE users 
            SET password_hash = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 
            RETURNING *;
        `;
        const values = [id, newPasswordHash];

        const result = await queryWithRetry(query, values);
        return result[0];
    }

    /**
     * Hapus user
     * @param id ID user
     */
    static async deleteUser(id: string): Promise<void> {
        const query = 'DELETE FROM users WHERE id = $1';

        try {
            await queryWithRetry(query, [id]);
        } catch (err) {
            throw new Error('Error deleting user');
        }
    }
}
