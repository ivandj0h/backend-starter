import { ICompanyService } from './company.service.interface';
import { ICompany } from '@/interfaces/company.interface';
import { logger } from '@/utils/logger';
import { CompanyRepository } from '@/repositories/company.repository';
import { RESPONSE_MESSAGES } from '@/constants/response-constants';

/**
 * CompanyServiceImpl
 *
 * Implementation of the ICompanyService interface.
 * Handles business logic for managing companies, including CRUD operations and enable/disable functionality.
 */
export class CompanyServiceImpl implements ICompanyService {
    /**
     * Create a new company.
     * @param name Name of the company
     * @param logoUrl URL for the company logo (optional)
     * @param timezone Timezone of the company (default: 'UTC')
     * @param subscriptionTier Subscription tier of the company (default: 'free')
     * @param subscriptionStatus Subscription status (default: 'active')
     * @returns Created company object
     */
    async createCompany(
        name: string,
        logoUrl?: string,
        timezone: string = 'UTC',
        subscriptionTier: string = 'free',
        subscriptionStatus: string = 'active'
    ): Promise<ICompany> {
        try {
            const companyData = {
                name,
                logoUrl,
                timezone,
                subscriptionTier,
                subscriptionStatus
            };

            const company = await CompanyRepository.createCompany(companyData);
            logger.info(`Company created: ${name}`);
            return company;
        } catch (error) {
            logger.error(`Error creating company: ${error}`);
            throw new Error(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all companies or search by keyword (name).
     * @param keyword Search keyword (optional)
     * @returns List of companies
     */
    async getAllCompanies(keyword?: string): Promise<ICompany[]> {
        try {
            const companies = await CompanyRepository.getAllCompanies(keyword);
            logger.info(`Fetched ${companies.length} companies`);
            return companies;
        } catch (error) {
            logger.error(`Error fetching companies: ${error}`);
            throw new Error(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get a company by its ID.
     * @param id Company ID
     * @returns Company object or undefined if not found
     */
    async getCompanyById(id: string): Promise<ICompany | null> {
        try {
            const company = await CompanyRepository.getCompanyById(id);
            return company || null;
        } catch (error) {
            logger.error(`Error fetching company by ID: ${error}`);
            throw new Error(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update a company's details.
     * @param id Company ID
     * @param data Updated data
     * @returns Updated company object
     */
    async updateCompany(id: string, data: any): Promise<ICompany> {
        try {
            const updatedCompany = await CompanyRepository.updateCompany(id, data);
            logger.info(`Company updated: ${id}`);
            return updatedCompany;
        } catch (error) {
            logger.error(`Error updating company: ${error}`);
            throw new Error(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete a company.
     * @param id Company ID
     */
    async deleteCompany(id: string): Promise<void> {
        try {
            await CompanyRepository.deleteCompany(id);
            logger.info(`Company deleted: ${id}`);
        } catch (error) {
            logger.error(`Error deleting company: ${error}`);
            throw new Error(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Enable or disable a company.
     * @param id Company ID
     * @param isActive Whether the company is active or disabled
     * @returns Updated company object
     */
    async enableDisableCompany(id: string, isActive: boolean): Promise<ICompany> {
        try {
            const updatedCompany = await CompanyRepository.setCompanyActiveStatus(id, isActive);
            logger.info(`Company ${isActive ? 'enabled' : 'disabled'}: ${id}`);
            return updatedCompany;
        } catch (error) {
            logger.error(`Error enabling/disabling company: ${error}`);
            throw new Error(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }
}
