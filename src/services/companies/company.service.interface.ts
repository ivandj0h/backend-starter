/**
 * ICompanyService
 *
 * Interface for handling company-related operations.
 * Defines methods for creating, retrieving, updating, and deleting companies.
 */
export interface ICompanyService {
    createCompany(name: string, logoUrl?: string, timezone?: string, subscriptionTier?: string, subscriptionStatus?: string): Promise<any>;
    getAllCompanies(keyword?: string): Promise<any[]>;
    getCompanyById(id: string): Promise<any | undefined>;
    updateCompany(id: string, data: any): Promise<any>;
    deleteCompany(id: string): Promise<void>;
    enableDisableCompany(id: string, isActive: boolean): Promise<any>;
}
