import { Request, Response } from 'express';
import { Controller } from '@/configs/decorators/controller.decorator';
import { GET, POST, PATCH, DELETE, PathParam, QueryParam } from '@/configs/decorators/route.decorator';
import { CompanyServiceImpl } from '@/services/companies/company.service.impl';
import { LoggerFactory } from '@/utils/logger.factory';
import { ResponseEntity } from '@/utils/response-entity.util';
import { RESPONSE_MESSAGES, STATUS_CODES } from '@/constants/response-constants';
import {authMiddleware} from "@/middlewares/auth/auth.middleware";

/**
 * CompanyController
 *
 * Menangani permintaan terkait perusahaan (companies),
 * seperti CRUD operations dan enable/disable company.
 */
@Controller('/companies')
export class CompanyController {
    private readonly logger = LoggerFactory.getLogger('CompanyController');
    private readonly companyService = new CompanyServiceImpl();

    /**
     * Menghandle request untuk mendapatkan semua company atau pencarian berdasarkan keyword.
     * @param req Request dari client
     * @param res Response dari server
     * @param search Optional search keyword dari query param
     */
    @GET('/', [authMiddleware])
    async getAllCompanies(
        @QueryParam('search') search: string | undefined,
        req?: Request,
        res?: Response
    ): Promise<Response> {
        if (!res) {
            throw new Error('Response object is undefined');
        }

        try {
            this.logger.info("getAllCompanies called");
            const companies = await this.companyService.getAllCompanies(search);
            return ResponseEntity.ok(res, RESPONSE_MESSAGES.COMPANIES_FETCHED, companies);
        } catch (error) {
            this.logger.error(`getAllCompanies() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Menghandle request untuk mendapatkan company berdasarkan ID.
     * @param req Request dari client
     * @param res Response dari server
     * @param id ID company dari path param
     */
    @GET('/:id', [authMiddleware])
    async getCompanyById(
        @PathParam('id') id: string,
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const company = await this.companyService.getCompanyById(id);
            if (!company) {
                return ResponseEntity.error(res, RESPONSE_MESSAGES.COMPANY_NOT_FOUND, STATUS_CODES.NOT_FOUND);
            }
            return ResponseEntity.ok(res, RESPONSE_MESSAGES.COMPANY_FETCHED, company);
        } catch (error) {
            this.logger.error(`getCompanyById() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Menghandle request untuk create company baru.
     * @param req Request dari client
     * @param res Response dari server
     * @returns JSON response dengan data company yang baru dibuat
     */
    @POST('/', [authMiddleware])
    async createCompany(req: Request, res: Response): Promise<Response> {
        const { name, logo_url, timezone, subscription_tier, subscription_status } = req.body;
        try {
            const company = await this.companyService.createCompany(
                name, logo_url, timezone, subscription_tier, subscription_status
            );
            return ResponseEntity.created(res, RESPONSE_MESSAGES.COMPANY_CREATED, company);
        } catch (error) {
            this.logger.error(`createCompany() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Menghandle request untuk update company.
     * @param req Request dari client
     * @param res Response dari server
     * @param id ID company dari path param
     * @returns JSON response dengan data company yang terupdate
     */
    @PATCH('/:id', [authMiddleware])
    async updateCompany(
        @PathParam('id') id: string,
        req: Request,
        res: Response,
    ): Promise<Response> {
        if (!req.body) {
            this.logger.error('Request body is missing');
            return ResponseEntity.error(res, 'Request body is missing', STATUS_CODES.BAD_REQUEST);
        }

        const data = req.body;

        try {
            const updatedCompany = await this.companyService.updateCompany(id, data);
            return ResponseEntity.updated(res, RESPONSE_MESSAGES.COMPANY_UPDATED, updatedCompany);
        } catch (error) {
            this.logger.error(`updateCompany() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Menghandle request untuk delete company.
     * @param req Request dari client
     * @param res Response dari server
     * @param id ID company dari path param
     */
    @DELETE('/:id', [authMiddleware])
    async deleteCompany(
        @PathParam('id') id: string,
        req: Request,
        res: Response,
    ): Promise<Response> {
        try {
            await this.companyService.deleteCompany(id);
            return ResponseEntity.deleted(res, RESPONSE_MESSAGES.COMPANY_DELETED, null);
        } catch (error) {
            this.logger.error(`deleteCompany() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Menghandle request untuk enable/disable company.
     * @param req Request dari client
     * @param res Response dari server
     * @param id ID company dari path param
     * @param isActive Status aktif/inaktif dari company
     */
    @PATCH('/:id/status', [authMiddleware])
    async enableDisableCompany(
        @PathParam('id') id: string,
        @QueryParam('isActive') isActive: boolean,
        req: Request,
        res: Response,
    ): Promise<Response> {
        try {
            const updatedCompany = await this.companyService.enableDisableCompany(id, isActive);
            return ResponseEntity.updated(res, RESPONSE_MESSAGES.COMPANY_STATUS_UPDATED, updatedCompany); // Cek apakah res diteruskan dengan benar
        } catch (error) {
            this.logger.error(`enableDisableCompany() failed: ${error}`);
            return ResponseEntity.error(res, RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }


}
