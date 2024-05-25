/**
 * @module app_manager
 * 
 * This will register events and routes for the application
 */

import express from 'express';
import { AppApiEndpoint, AppEvent, AppSingleModule, UserPermissionType } from '../interfaces/app_manager_interfaces';
import { AuthenticatedUser } from '../interfaces/jwt_token_user';
import { error_handler_wrapper } from './error_handler_wrapper';

var event_handlers = new Map<string, AppEvent[]>();
var api_endpoints = new Map<string, AppApiEndpoint>();
var modue_list = [];
var user_permission_list = Array<UserPermissionType>();


/**
 * Register an event handler
 * @param event_name 
 * @param handler 
 */

export function register_event(event:AppEvent){
    let handers:AppEvent[] = event_handlers.get(event.event_name);
    if(!handers){
        handers = [];
    }

    handers.push(event);
    event_handlers.set(event.event_name, handers);
}

/**
 * Register an api endpoint
 * @param route 
 * @param handler 
 */
export function register_api_endpoint(endpoint:AppApiEndpoint){
    api_endpoints.set(endpoint.route, endpoint);
}



/**
 * Raise an event
 */
export function raise_event(event_name:string, data:any){
    let handers:AppEvent[] = event_handlers.get(event_name);
    if(handers){
        handers.forEach((event:AppEvent) => {
            data = event.handler(data);
        });
    }
    return data;
}


// process of loading modules
export function load_modules(){
    // load modules.json
    const path = require('path');
    const fs = require('fs');
    const modules = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../data/system_modules.json")
        , 'utf8'));
    console.log("Loading modules...");
    modules.forEach((module_single:AppSingleModule) => {
        try {
            const module = require(`../system_modules/${module_single.start_point}`);
            if (typeof(module.init_module) === "function"){
                module.init_module();
            } else {
                console.log("Module " + module_single.module_name + " \x1b[31m \"init_module\" function not defined.\x1b[0m");
                return;
            }
            modue_list.push(module_single);
            console.log("Module " + module_single.module_name + " \x1b[32mloaded.\x1b[0m");
        } catch (error) {
            console.log("Module " + module_single.module_name + " \x1b[31merror.\x1b[0m");
            console.log(error);
        }
        
        
    });
} 




// add api endpoints to express app
export function add_api_endpoints(guest_router:express.Router, protected_router:express.Router){
    api_endpoints.forEach((endpoint:AppApiEndpoint) => {
        if (endpoint.is_protected === true){
            if (endpoint.method && endpoint.method === "POST"){
                if (endpoint.middlewares && endpoint.middlewares.length > 0){
                    protected_router.post(endpoint.route, endpoint.middlewares, error_handler_wrapper(endpoint.handler));
                } else{
                    protected_router.post(endpoint.route, error_handler_wrapper(endpoint.handler));
                }
            } else {
                if (endpoint.middlewares && endpoint.middlewares.length > 0){
                    protected_router.get(endpoint.route, endpoint.middlewares, error_handler_wrapper(endpoint.handler));
                } else {
                    protected_router.get(endpoint.route, error_handler_wrapper(endpoint.handler));
                }
            }
        } else {
            if (endpoint.method && endpoint.method === "POST"){
                if (endpoint.middlewares && endpoint.middlewares.length > 0){
                    guest_router.post(endpoint.route, endpoint.middlewares, error_handler_wrapper(endpoint.handler));
                }else {
                    guest_router.post(endpoint.route, error_handler_wrapper(endpoint.handler));
                }
            } else {
                if (endpoint.middlewares && endpoint.middlewares.length > 0){
                    guest_router.get(endpoint.route, endpoint.middlewares, error_handler_wrapper(endpoint.handler));
                } else {
                    guest_router.get(endpoint.route, error_handler_wrapper(endpoint.handler));
                }
            }
        }
    });
}


/**
 * Register user permissions
 */
export function register_user_permissions(permission:string, label:string, module_name:string, allowed_roles?:string[]){
    if (!allowed_roles){
        allowed_roles = ['admin'];
    }
    user_permission_list.push({name:permission, label, module:module_name, allowed_roles });
}

/**
 * Return all registered permissions
 */
export function get_registered_permissions(module_name?: string):UserPermissionType[]{
    if (module_name){
        return user_permission_list.filter((permission:UserPermissionType) => permission.module === module_name);
    }
    return user_permission_list;
}

/**
 * Check whether the given user has permission to access the given module
 */
export function check_user_permission(user:AuthenticatedUser, permission_name:string):boolean{
    if (user.role.permissions.includes('super-admin-permissions')){
        return true;
    }
    if (user.role.permissions.includes(permission_name)){
        return true;
    }
    return false;
}