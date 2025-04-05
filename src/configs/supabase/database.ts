/**
 * Supabase PostgreSQL Connection Config
 * Enterprise-grade DB connector with retry, logging, and health check
 * Located at: src/configs/supabase/database.ts
 */

import dotenv from 'dotenv';
import { Pool, PoolClient } from 'pg';
import { logger } from '@/utils/logger';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;
const SLOW_QUERY_THRESHOLD_MS = 500;

dotenv.config({
    path: `.env.${process.env.NODE_ENV || 'development'}`
});

if (!process.env.DATABASE_URL) {
    logger.error('Error: DATABASE_URL is not set in environment variables');
    process.exit(1);
}

logger.info(`DATABASE_URL: ${process.env.DATABASE_URL}`);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

/**
 * Executes a query with retry and slow query logging
 */
export async function queryWithRetry<T = any>(
    query: string,
    values: any[] = []
): Promise<T[]> {
    let attempt = 0;
    const start = Date.now();

    while (attempt < MAX_RETRIES) {
        try {
            const result = await pool.query(query, values);
            const duration = Date.now() - start;

            if (duration > SLOW_QUERY_THRESHOLD_MS) {
                logger.warn(`Slow Query Detected (${duration}ms): ${query}`);
            }

            return result.rows;
        } catch (err: any) {
            attempt++;
            logger.error(`DB Query Error (Attempt ${attempt}): ${err.message || err}`);
            logger.error(`Query: ${query}, Values: ${JSON.stringify(values)}`);
            logger.error(`Stack: ${err.stack}`);
            if (attempt >= MAX_RETRIES) throw err;
            await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
        }
    }
    throw new Error('Max retry reached');
}

/**
 * Health check for DB connection
 */
export async function isDatabaseHealthy(): Promise<boolean> {
    try {
        const client: PoolClient = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        return true;
    } catch (err) {
        logger.error('Database health check failed:', err);
        return false;
    }
}

// Tambahin di database.ts
export async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        logger.info(`Connection test: ${JSON.stringify(result.rows)}`);
        return true;
    } catch (err) {
        logger.error(`Connection test failed: ${err}`);
        return false;
    }
}

export default pool;
