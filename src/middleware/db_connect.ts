/**
 * Connect to the databases
 */

import { Request, Response, NextFunction } from 'express';
import ConnectMongoDB from '../lib/connect_mongodb';
//import { AuthenticatedUser } from '../interfaces/app_manager_interfaces';

export function db_connect(req:Request, res:Response, next:NextFunction){
    // Get token from header
    console.log('Connecting to MongoDB');
    try {
        ConnectMongoDB().then(()=>{
            next();
        }).catch((err)=>{
            console.log(err);
            res.status(500).json({msg: 'Internal Server Error'});
        });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({msg: 'Internal Server Error'});
    }
}