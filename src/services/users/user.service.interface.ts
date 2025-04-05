import { IUser } from "@/interfaces/user.interface";

/**
 * UserService Interface
 *
 * Defines the contract for the user service.
 * All methods related to user management must be implemented.
 */
export interface UserService {
    /**
     * Get all users or search based on keyword.
     * @param keyword Optional search term based on full name, email, etc.
     * @returns List of users
     */
    getAllUsers(keyword?: string): Promise<IUser[]>;

    /**
     * Get a user by their ID.
     * @param id UUID of the user
     * @returns The user if found, otherwise undefined
     */
    getUserById(id: string): Promise<IUser | undefined>;

    /**
     * Create a new user.
     * @param userData Data to create a new user
     * @returns The newly created user
     */
    createUser(userData: IUser): Promise<IUser>;

    /**
     * Update an existing user.
     * @param id The user ID
     * @param updates Data to update the user
     * @returns The updated user
     */
    updateUser(id: string, updates: Partial<IUser>): Promise<IUser>;

    /**
     * Delete a user.
     * @param id The user ID
     */
    deleteUser(id: string): Promise<void>;

    /**
     * Update role_id user
     * @param id UUID dari user
     * @param role_id ID role yang akan di-set
     */
    updateRole(id: string, role_id: string): Promise<IUser>;

    /**
     * Update is_active status user
     * @param id UUID dari user
     * @param is_active Status aktif baru
     */
    updateIsActive(id: string, is_active: boolean): Promise<IUser>;

    /**
     * Update avatar user
     * @param id UUID dari user
     * @param file Avatar file yang akan di-upload
     */
    updateAvatar(id: string, file: Express.Multer.File): Promise<IUser>;

    /**
     * Update password user
     * @param id UUID dari user
     * @param oldPassword Password lama
     * @param newPassword Password baru
     * @returns Updated user with new password
     */
    updatePassword(id: string, oldPassword: string, newPassword: string): Promise<IUser>;
}
