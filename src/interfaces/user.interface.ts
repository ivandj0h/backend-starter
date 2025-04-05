/**
 * IUser
 *
 * Defines the shape of a User entity as represented in the application.
 * Matches the structure of the Supabase `users` table.
 */
export interface IUser {
    id: string;
    company_id: string;
    email: string;
    password_hash: string | null;
    full_name: string | null;
    role_id: string;
    department_id: string;
    avatar_url: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface IUserWithExtras extends IUser {
    role_name: string;
    company_name: string;
    department_name: string;
}