import { AuthenticatedUser } from "../../interfaces/jwt_token_user";

/**
 * Adding user Field to Express Request
 *//*
declare namespace Express {
    export interface Request {
        user?: AuthenticatedUser;
    }
}*/

export {};

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
            rawBody?: any;
        }
    }
}