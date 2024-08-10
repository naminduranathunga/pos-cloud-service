/**
 * @module app_manager
 * 
 * This will register events and routes for the application
 */

import express from 'express';
import { AppApiEndpoint, AppEvent, AppSingleModule, UserPermissionType } from '../interfaces/app_manager_interfaces';
import { AuthenticatedUser } from '../interfaces/jwt_token_user';
import { error_handler_wrapper } from './error_handler_wrapper';
import * as path from 'path';
import * as fs from 'fs';
import e from 'express';
//const path = require('path');
//const fs = require('fs');

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
    event.rank = event.rank || 100;
    let handers:AppEvent[] = event_handlers.get(event.event_name);
    if(!handers){
        handers = [];
    }
    handers.push(event);
    event_handlers.set(event.event_name, handers);
}

/**
 * Organize events by rank
 * 
 */
export function organize_events(){
    event_handlers.forEach((handlers:AppEvent[], event_name:string) => {
        handlers.sort((a:AppEvent, b:AppEvent) => {
            return a.rank - b.rank;
        });
    });
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
export function raise_event(event_name:string, data:any, req?:express.Request, res?:express.Response){
    let handers:AppEvent[] = event_handlers.get(event_name);
    if(handers){
        handers.forEach((event:AppEvent) => {
            data = event.handler(data, req, res);
        });
    }
    return data;
}

function scan_module_folder(){
    // get 
    console.log('Directory name:', __dirname);
    const system_modules_path = require('path').resolve(__dirname, '../system_modules');
    const folder_list = fs.readdirSync(system_modules_path);
    var module_list = [];

    folder_list.forEach((folder_name:string) => {
        let module_current:AppSingleModule = {
            module_name: folder_name,
            start_point: folder_name + "/main.js",
            module_path: system_modules_path + "/" + folder_name
        };
        module_list.push(module_current);
    });
    return module_list;
}

// inactive modules --
/**
 * 
 * modules defined in the inactive_modules.json file will be skipped.
 */
function get_inactive_modules(){
    const inactive_modules = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../data/config/inactive_modules.json"), 'utf8'));
    return inactive_modules as string[];
}

// process of loading modules
export function load_modules(){
    // load modules.json
    
    scan_module_folder();
    //const modules = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../data/system_modules.json"), 'utf8'));
    console.log("Loading modules...");
    const modules = scan_module_folder();
    const inactive_modules = get_inactive_modules();

    modules.forEach((module_single:AppSingleModule) => {
        try {
            if (inactive_modules.includes(module_single.module_name)){
                modue_list.push(module_single); // still add to the module list
                console.log("\t> Module " + module_single.module_name + ".....[\x1b[33mskipped\x1b[0m]");
                return;
            }
            const module = require(`../system_modules/${module_single.start_point}`);
            if (typeof(module.init_module) === "function"){
                module.init_module();
            } else {
                console.log("\t> Module " + module_single.module_name + " \x1b[31m \"init_module\" function not defined.\x1b[0m");
                return;
            }
            modue_list.push(module_single);
            console.log("\t> Module " + module_single.module_name + ".....[\x1b[32mloaded\x1b[0m]");
        } catch (error) {
            console.log("\t> Module " + module_single.module_name + ".....[\x1b[31merror\x1b[0m]");
            console.log(error);
        }
    });
} 




// add api endpoints to express app
export function add_api_endpoints(guest_router:express.Router, protected_router:express.Router, unp_guest_router:express.Router, unp_protected_router:express.Router){
    api_endpoints.forEach((endpoint:AppApiEndpoint) => {
        if (endpoint.is_protected === true){
            if (endpoint.unparsed !== true){
                if (typeof(endpoint.handler) === "function"){
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
                    protected_router.use(endpoint.route, endpoint.handler);
                }
            } else {
                if (typeof(endpoint.handler) === "function"){
                    if (endpoint.method && endpoint.method === "POST"){
                        if (endpoint.middlewares && endpoint.middlewares.length > 0){
                            unp_protected_router.post(endpoint.route, endpoint.middlewares, error_handler_wrapper(endpoint.handler));
                        } else{
                            unp_protected_router.post(endpoint.route, error_handler_wrapper(endpoint.handler));
                        }
                    } else {
                        if (endpoint.middlewares && endpoint.middlewares.length > 0){
                            unp_protected_router.get(endpoint.route, endpoint.middlewares, error_handler_wrapper(endpoint.handler));
                        } else {
                            unp_protected_router.get(endpoint.route, error_handler_wrapper(endpoint.handler));
                        }
                    }
                } else {
                    unp_protected_router.use(endpoint.route, endpoint.handler);
                }
            }
        } else {
            if (endpoint.unparsed === true){
                if (endpoint.is_express_router !== true){
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
                } else {
                    guest_router.use(endpoint.route, endpoint.handler);
                }
            } else {
                if (endpoint.is_express_router !== true){ 
                    if (endpoint.method && endpoint.method === "POST"){
                        if (endpoint.middlewares && endpoint.middlewares.length > 0){
                            unp_guest_router.post(endpoint.route, endpoint.middlewares, error_handler_wrapper(endpoint.handler));
                        }else {
                            unp_guest_router.post(endpoint.route, error_handler_wrapper(endpoint.handler));
                        }
                    } else {
                        if (endpoint.middlewares && endpoint.middlewares.length > 0){
                            unp_guest_router.get(endpoint.route, endpoint.middlewares, error_handler_wrapper(endpoint.handler));
                        } else {
                            unp_guest_router.get(endpoint.route, error_handler_wrapper(endpoint.handler));
                        }
                    }
                } else {
                    unp_guest_router.use(endpoint.route, endpoint.handler);
                    console.log("Route: ", endpoint.route);
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