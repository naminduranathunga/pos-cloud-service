import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import { AddSubscriptionToCompany } from "../../functions/AddSubscriptionToCompany";
import { CompanySubscription } from "../../interfaces/CompanySubscription";
import mongoose from "mongoose";


export async function api_add_subscription_to_company(req:Request, res: Response){
    const user = req.user;
    // permission validation
    // only super-admins
    if (!check_user_permission(user, "system-administration")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    const {company_id, subscription} = req.body as {
        company_id: string,
        subscription: CompanySubscription
    };

    /*try {
        
    } catch (error) {
            
    }*/

    try {
        const comp_id = mongoose.Types.ObjectId.createFromHexString(company_id);
        AddSubscriptionToCompany(comp_id, subscription);

        return res.status(200).json({
            message: "Subscription added successfully"
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
}