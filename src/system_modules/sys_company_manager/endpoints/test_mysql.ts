import { Request, Response } from "express";
import ConnectMySQL from "../../../lib/connect_sql_server";
import { RowDataPacket } from "mysql2";
import { decrypt_company_db_password } from "../../../lib/company_db_passwords";
import { migrate_company_db } from "../../../migrations/migrate_company_db";


export default async function test_mysql_endpoint(req: Request, res: Response){
    const x = await ConnectMySQL(true, true);

    let output = "scdgg";
 

    await migrate_company_db("db_demo_company_3");

    output = decrypt_company_db_password("bcb5fb5ad306c2c892c73f2f5ad633d662e2566e0d8585bb42b3ae8417ce401c");
    
    res.send(output);
}