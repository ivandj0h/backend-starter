import 'reflect-metadata';

/**
 * Controller decorator
 *
 * Menandai sebuah class sebagai controller dengan prefix tertentu untuk routing.
 */
export function Controller(prefix: string): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata('prefix', prefix, target);

        if (!Reflect.hasMetadata('routes', target)) {
            Reflect.defineMetadata('routes', [], target);
        }
    };
}

/**
* Middleware decorator
* Menambahkan middleware ke metode yang diberi decorator.
*/
export function Middleware(middleware: Function): MethodDecorator {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const routes: any[] = Reflect.getMetadata('routes', target.constructor) || [];

        // Find route for current handler and add middleware
        const route = routes.find((route: any) => route.handlerName === propertyKey);
        if (route) {
            route.middlewares = route.middlewares || [];
            route.middlewares.push(middleware);
        }

        Reflect.defineMetadata('routes', routes, target.constructor);
    };
}
