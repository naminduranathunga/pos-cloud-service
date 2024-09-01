
import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import mongoose from "mongoose";
import Company from "../../../../schemas/company/company_scema";
import { migrate_company_db, rollback_company_db } from "../../../../migrations/migrate_company_db";


/**
 * Endpoint api/v1/sys-company-manager/company-administration/rollback-company-dbs
 * Protected Route
 * This endpoint is used to migrate company databases to the latest version
 * @param req  
 * @param res 
 */
export default async function rollback_comp_db_migrations(req: Request, res: Response){
    const companies = req.body as {ids?: string[], limit?: number};
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

    // validate company ids
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

    // now iterate through the company list and migrate the databases
    let return_report = [];

    for(let i = 0; i < company_list.length; i++){
        const company = company_list[i];
        // call the migration function
        try {
            const dbname = company?.company_database?.name; 
            if (!dbname){
                throw new Error("Company database name not found");
            }
            await rollback_company_db(dbname, companies.limit||1);
            return_report.push({
                id: company._id,
                name: company.name,
                dbname: dbname,
                status: "success"
            });
        } catch (error:any) {
            console.error(error); 
            return_report.push({
                id: company._id,
                name: company.name,
                status: "error",
                error: error.message
            });           
        }
    }

    res.json(return_report);
}