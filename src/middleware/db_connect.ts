/**
 * Connect to the databases
 */

import { Request, Response, NextFunction } from 'express';
import ConnectMongoDB from '../lib/connect_mongodb';
//import { AuthenticatedUser } from '../interfaces/app_manager_interfaces';

export function db_connect(req:Request, res:Response, next:NextFunction){
    // Get token from header
    
    try {
        ConnectMongoDB().then(()=>{
            console.log('Connected to MongoDB');
            next();
        }).catch((err)=>{
            console.log('Error connecting to MongoDB');
            res.status(500).json({msg: 'Internal Server Error'});
        });
        
    } catch (err) {
        res.status(500).json({msg: 'Internal Server Error'});
    }
}