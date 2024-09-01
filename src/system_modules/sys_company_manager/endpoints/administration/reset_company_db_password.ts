import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import mongoose from "mongoose";
import Company from "../../../../schemas/company/company_scema";
import create_company_db from "../../funtions/create_company_db";
import { encrypt_company_db_password, genetate_new_company_db_password } from "../../../../lib/company_db_passwords";
import ConnectMySQL from "../../../../lib/connect_sql_server";

/**
 * This function is usefull to reset  or change password when encryption key was changed
 * @param req 
 * @param res 
 * @returns 
 */
export default async function reset_company_db_password(req: Request, res:Response){
    const companies = req.body as {ids?: string[]};
    const user = req.user;

    // permission validation
    // only super-admins
    if (!check_user_permission(user, "system-administration")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    let company_list:any[];

    if (companies.ids && Array.isArray(companies.ids)){
        let all_company_ids_valid = true;
        const company_ids = (companies.ids as string[]).map((id)=> {
            if (!mongoose.Types.ObjectId.isValid(id)){
                all_company_ids_valid = false;
                return null;
            }
            return mongoose.Types.ObjectId.createFromHexString(id);
        });
        if (!all_company_ids_valid){
            res.status(400).json({
                message: "Invalid company ids"
            });
            return;
        }

        company_list = await Company.find({_id: {$in: company_ids}});
    } else {
        company_list = await Company.find({});
    }


    // iterate companies and check if db exists. if not create one, else reset pw
    const results:any = [];
    const conn = await ConnectMySQL(false);
    for (let i = 0; i < company_list.length; i++){
        const comp = company_list[i];
        try {
            if (!(comp.company_database && comp.company_database.name)){
                console.log(comp);
                await create_company_db(comp);
            } else {
                const password = genetate_new_company_db_password();
                const encrypted_password = encrypt_company_db_password(password);
                const sql = `ALTER USER '${comp.company_database.username}'@'%' IDENTIFIED BY ?`
                await conn.query(sql, [password]);
                comp.company_database.password = encrypted_password;
                comp.markModified("company_database");
                await comp.save();
            }
            results.push({
                id: comp._id,
                name: comp.name,
                status: "success",
            })

        } catch (error) {
            results.push({
                id: comp._id,
                name: comp.name,
                status: "error",
                error: error.message
            });
            console.error(error);
        }
    }
    res.json(results);

}