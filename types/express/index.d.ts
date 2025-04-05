import { JwtPayload } from "jsonwebtoken";

declare module "express" {
    export interface Request {
        user?: string | JwtPayload;
    }
}
