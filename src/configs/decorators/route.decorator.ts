import 'reflect-metadata';

/**
 * RouteDefinition
 * Struktur metadata untuk setiap route handler yang didekorasi.
 */
export type RouteDefinition = {
    method: 'get' | 'post' | 'patch' | 'delete';
    path: string;
    handlerName: string;
    middlewares?: Function[];
};

/**
 * Helper untuk membuat route decorator (@GET, @POST, dst.)
 */
function createRouteDecorator(method: RouteDefinition['method']) {
    return (path: string = '/', middlewares: Function[] = []) => {
        return (target: any, propertyKey: string) => {
            const routes: RouteDefinition[] = Reflect.getMetadata('routes', target.constructor) || [];

            routes.push({
                method,
                path,
                handlerName: propertyKey,
                middlewares,
            });

            Reflect.defineMetadata('routes', routes, target.constructor);
        };
    };
}


/**
 * GET decorator
 */
export const GET = createRouteDecorator('get');

/**
 * POST decorator
 */
export const POST = createRouteDecorator('post');

/**
 * PATCH decorator
 */
export const PATCH = createRouteDecorator('patch');

/**
 * DELETE decorator
 */
export const DELETE = createRouteDecorator('delete');

/**
 * PathParam decorator
 */
export function PathParam(paramName: string): ParameterDecorator {
    return (target, propertyKey, parameterIndex) => {
        const existingParams = Reflect.getMetadata('pathParams', target, propertyKey as string) || [];
        existingParams.push({ index: parameterIndex, name: paramName });
        Reflect.defineMetadata('pathParams', existingParams, target, propertyKey as string);
    };
}

/**
 * QueryParam decorator
 */
export function QueryParam(paramName: string): ParameterDecorator {
    return (target, propertyKey, parameterIndex) => {
        const existingParams = Reflect.getMetadata('queryParams', target, propertyKey as string) || [];
        existingParams.push({ index: parameterIndex, name: paramName });
        Reflect.defineMetadata('queryParams', existingParams, target, propertyKey as string);
    };
}
