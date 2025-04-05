/**
 * ICompany
 *
 * Defines the shape of a Company entity as represented in the application.
 * Matches the structure of the Supabase `companies` table.
 */
export interface ICompany {
    id: string;
    name: string;
    logo_url: string | null;
    timezone: string | null;
    subscription_tier: string | null;
    subscription_status: string | null;
    is_active: boolean | null;
    created_at: string;
    updated_at: string;
}