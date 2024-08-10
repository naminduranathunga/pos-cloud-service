import mongoose from "mongoose";
import { CompanySubscription } from "../interfaces/CompanySubscription";
import Company from "../../../schemas/company/company_scema";


export async function AddSubscriptionToCompany(company_Id:mongoose.Types.ObjectId, subscription: CompanySubscription){
    /**
     * Subscription validation
     */
    if (typeof subscription.packageExpires === "string"){
        subscription.packageExpires = new Date(subscription.packageExpires);
    }
    

    // Check if the company exists
    const company = await Company.findOne({_id: company_Id});
    if(!company){
        throw new Error("Company not found");
    }

    // add the subscription to the company
    company.subscription = subscription;
    await company.save();
}