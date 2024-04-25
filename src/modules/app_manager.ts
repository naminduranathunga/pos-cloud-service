/**
 * @module app_manager
 * 
 * This will register events and routes for the application
 */

import express from 'express';
import { AppApiEndpoint, AppEvent, AppSingleModule } from '../interfaces/app_manager_interfaces';

var event_handlers = new Map<string, AppEvent[]>();
var api_endpoints = new Map<string, AppApiEndpoint>();
var modue_list = [];


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

    modules.forEach((module_single:AppSingleModule) => {
        const module = require(`../system_modules/${module_single.start_point}`);
        module.init_module();
        modue_list.push(module_single);
    });
} 



// add api endpoints to express app

export function add_api_endpoints(guest_router:express.Router, protected_router:express.Router){
    api_endpoints.forEach((endpoint:AppApiEndpoint) => {
        if (endpoint.is_protected){
            protected_router.get(endpoint.route, endpoint.handler);
        } else {
            guest_router.get(endpoint.route, endpoint.handler);
        }
    });
}