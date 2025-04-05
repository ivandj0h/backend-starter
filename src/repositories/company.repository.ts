import { logger } from '@/utils/logger';
import pool, {queryWithRetry} from '@/configs/supabase/database';
import { ICompany } from '@/interfaces/company.interface';

/**
 * CompanyRepository
 *
 * This class handles all interactions with the companies table in the database.
 */
export class CompanyRepository {
    /**
     * Get all companies with optional search keyword.
     * @param search The search term to filter companies by name or other attributes
     * @returns List of companies
     */
    static async getAllCompanies(search?: string): Promise<ICompany[]> {
        let query = 'SELECT * FROM companies';
        const values: any[] = [];

        if (search) {
            query += ' WHERE name ILIKE $1';
            values.push(`%${search}%`);
        }

        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (err) {
            logger.error('Error fetching companies:', err);
            throw new Error('Error fetching companies');
        }
    }

    /**
     * Get company by ID
     * @param id The company ID
     * @returns Company data if found
     */
    static async getCompanyById(id: string): Promise<ICompany | null> {
        const query = `
    SELECT * FROM companies WHERE id = $1;
  `;
        const values = [id];

        const result = await queryWithRetry(query, values);
        return result[0] || null;
    }

    /**
     * Create a new company
     * @returns The newly created company
     * @param companyData
     */
    static async createCompany(companyData: {
        name: string;
        logoUrl?: string;
        timezone: string;
        subscriptionTier: string;
        subscriptionStatus: string;
    }): Promise<ICompany> {
        const { name, logoUrl, timezone, subscriptionTier, subscriptionStatus } = companyData;
        const query = `
      INSERT INTO companies (name, logo_url, timezone, subscription_tier, subscription_status, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *;
    `;
        const values = [name, logoUrl, timezone, subscriptionTier, subscriptionStatus];

        const result = await queryWithRetry(query, values);
        return result[0];
    }

    /**
     * Update company data by ID
     * @param id The company ID
     * @param updates The company data to be updated
     * @returns The updated company
     */
    static async updateCompany(id: string, updates: Partial<ICompany>): Promise<ICompany> {
        const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const query = `UPDATE companies SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
        const values = [id, ...Object.values(updates)];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (err) {
            logger.error('Error updating company:', err);
            throw new Error('Error updating company');
        }
    }

    /**
     * Delete a company by ID
     * @param id The company ID
     * @returns A confirmation message
     */
    static async deleteCompany(id: string): Promise<void> {
        const query = 'DELETE FROM companies WHERE id = $1';

        try {
            await pool.query(query, [id]);
        } catch (err) {
            logger.error('Error deleting company:', err);
            throw new Error('Error deleting company');
        }
    }

    /**
     * Enable or disable a company
     * @param id The company ID
     * @param isActive The status to set (true for active, false for disabled)
     * @returns The updated company
     */
    static async setCompanyActiveStatus(id: string, isActive: boolean): Promise<ICompany> {
        const query = 'UPDATE companies SET is_active = $1 WHERE id = $2 RETURNING *';
        const values = [isActive, id];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (err) {
            logger.error('Error changing company active status:', err);
            throw new Error('Error changing company active status');
        }
    }
}
