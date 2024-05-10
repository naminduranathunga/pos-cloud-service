import { NextFunction, Request, Response } from "express"


export interface AppEvent {
    event_name: string,
    handler: Function
};

export interface AppApiEndpoint {
    route: string,
    is_protected: boolean,
    method?: string, 
    handler: (req: Request, res: Response) => void
};

export interface AppSingleModule {
    module_name: string,
    module_path: string,
    start_point: string
};

export interface UserPermissionType {
    name: string,
    label: string,
    module: string,
    allowed_roles: string[]
};

export interface AuthenticatedUser {
    _id: string,
    first_name: string,
    last_name: string,
    email: string,
    role: {
        _id: string;
        name: string;
        permissions: string[];
    }|string,
    company?: {
        _id: string,
        name: string
    }|string
}