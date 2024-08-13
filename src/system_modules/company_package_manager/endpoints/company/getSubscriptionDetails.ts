import { Request, Response } from "express";
import ConnectMongoDB from "../../../../lib/connect_mongodb";
import mongoose from "mongoose";
import Company from "../../../../schemas/company/company_scema";
import { check_user_permission } from "../../../../modules/app_manager";


export default async function get_company_subscription_details(req: Request, res:Response) {
    const user = req.user;
    // permission validation
    // only super-admins
    if (!check_user_permission(user, "system-administration")) {
        
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    const {company_id} = req.params as {company_id: string};

    try {
        await ConnectMongoDB();
        const comp_id = mongoose.Types.ObjectId.createFromHexString(company_id);
        const company = await Company.findOne({_id: comp_id});
        if(!company){
            throw new Error("Company not found");
        }

        return res.status(200).json({
            message: "Subscription added successfully",
            subscription: company.subscription||{}
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
}