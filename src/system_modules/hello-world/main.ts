/**
 * This is an example module that will be loaded by the app_manager
 * 
 * each module has a function init_module()
 */

import { Request, Response, text } from "express";
import { raise_event, register_api_endpoint, register_event } from "../../modules/app_manager";
import { get_user_text } from "./extra";


export function init_module(){
    register_event({
        event_name: "hello_event",
        handler: hello_world
    });
    register_event({
        event_name: "get_user_text",
        handler: get_user_text
    })
    register_api_endpoint({
        route: '/hello-world',
        is_protected: false,
        handler: api_endpoint_hello_world
    });
    console.log('Hello world module loaded');
}


export function hello_world(data:any){
    console.log('hello world event called');
    return { text: 'Hello world' };
}

export function api_endpoint_hello_world(req: Request, res: Response){
    console.log('hello world api endpoint called');
    const {text} = raise_event('hello_event', {});
    const {dat} = raise_event('get_user_text', {}) ;
    res.json({text, dat});
}