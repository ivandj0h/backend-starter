import { Application, Request, Response } from 'express';
import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import {authMiddleware} from "@/middlewares/auth/auth.middleware";

/**
 * Daftar method HTTP yang diizinkan.
 */
const allowedMethods = ['get', 'post', 'patch', 'delete'] as const;
type HttpMethod = typeof allowedMethods[number];

/**
 * Base prefix global untuk semua endpoint API.
 * Contoh: /api/v1
 */
const globalPrefix = process.env.APP_API_PREFIX || '/api/v1';



/**
 * registerRoutes
 *
 * Mendaftarkan semua controller secara dinamis dan menerapkan route decorators.
 * Mengambil metadata dari decorator untuk mengatur route, method, dan parameter.
 *
 * @param app Express application instance
 */
export function registerRoutes(app: Application): void {
    const protectedRoutes = require(path.join(__dirname, '../data/protected-routes.json')).protectedRoutes;
    const controllersDir = path.join(__dirname, '../controllers');
    const controllerFiles = fs
        .readdirSync(controllersDir)
        .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    controllerFiles.forEach((file) => {
        const controllerPath = path.join(controllersDir, file);
        const controllerModule = require(controllerPath);

        const ControllerClass = controllerModule.default || Object.values(controllerModule)[0];
        const controllerInstance = new ControllerClass();
        const controllerClass = controllerInstance.constructor;

        const prefix = Reflect.getMetadata('prefix', controllerClass);
        const routes = Reflect.getMetadata('routes', controllerClass) || [];

        routes.forEach((route: any) => {
            const fullPath = globalPrefix + prefix + route.path;
            const method = route.method as HttpMethod;

            if (protectedRoutes.includes(route.path)) {
                route.middlewares = route.middlewares || [];
                if (!route.middlewares.includes(authMiddleware)) {
                    route.middlewares.push(authMiddleware);
                    console.log(`Middleware added for route: ${route.path}`);
                }
            }

            const handler = async (req: Request, res: Response) => {
                const queryParams = Reflect.getMetadata('queryParams', controllerInstance, route.handlerName) || [];
                const pathParams = Reflect.getMetadata('pathParams', controllerInstance, route.handlerName) || [];

                const args: any[] = [];
                queryParams.forEach((param: any) => args[param.index] = req.query[param.name]);
                pathParams.forEach((param: any) => args[param.index] = req.params[param.name]);

                args.push(req, res);
                return controllerInstance[route.handlerName](...args);
            };

            const middlewares = route.middlewares || [];
            if (allowedMethods.includes(method)) {
                app[method](fullPath, ...middlewares, handler);
                console.log(`✅ Registered [${method.toUpperCase()}] ${fullPath}`);
            } else {
                console.warn(`⚠️ Unsupported method: ${route.method} in ${file}`);
            }
        });
    });
}
