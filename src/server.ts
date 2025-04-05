import 'reflect-metadata';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

import { RESPONSE_MESSAGES } from '@/constants/response-constants';
import { ResponseEntity } from '@/utils/response-entity.util';
import { accessLogMiddleware } from '@/middlewares/access-log.middleware';
import { registerRoutes } from '@/routes';
import { testConnection } from '@/configs/supabase/database';

// Load environment variables
const envPath = path.resolve(
    __dirname,
    process.env.NODE_ENV ? `../.env.${process.env.NODE_ENV}` : '../.env.development'
);
dotenv.config({ path: envPath });

// Ensure required env variables are set
const requiredEnvs = ['DATABASE_URL', 'APP_BACKEND_NAME', 'APP_BACKEND_PORT'];
requiredEnvs.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} is not set in .env file`);
        process.exit(1);
    }
});

const app = express();
console.log('APP_FRONTEND_URL:', process.env.APP_FRONTEND_URL);
app.use(
    cors({
        origin: process.env.APP_FRONTEND_URL,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(accessLogMiddleware);

app.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

// Health Check Endpoint
app.get('/', (_: Request, res: Response) => {
    return ResponseEntity.ok(res, RESPONSE_MESSAGES.SERVICE_RUNNING, null);
});

// Register Routes
registerRoutes(app);

// Start the Server
const PORT = Number(process.env.APP_BACKEND_PORT) || 2500;

app.listen(PORT, async () => {
    try {
        const dbStatus = await testConnection();
        console.log('✅ DB Connected:', dbStatus);
    } catch (error) {
        console.error('❌ DB Connection Error:', error);
        process.exit(1);
    }

    console.log(`🚀 ${process.env.APP_BACKEND_NAME} running at http://localhost:${PORT}`);
});
