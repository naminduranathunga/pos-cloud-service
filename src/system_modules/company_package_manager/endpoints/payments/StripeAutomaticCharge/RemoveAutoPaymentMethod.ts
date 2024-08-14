import { Request, Response } from "express";
import { check_user_permission } from "../../../../../modules/app_manager";
import Company from "../../../../../schemas/company/company_scema";
import GetOrCreateStripeCustomer from "../../../functions/StripeAutopay/GetOrCreateStripCustomer";
import getStripe from "../../../functions/Checkout/GetStripe";


export default async function stripe_remove_payment_methods(req: Request, res: Response){
    const user = req.user;
    if (!user || !user.company) {
        return res.status(400).json({
            message: "User not found"
        });
    }
    if (!check_user_permission(user, "company-admin")){
        return res.status(403).json({
            "message": "No permissions"
        });
    }

    const { payment_method_id } = req.body as { payment_method_id: string };

    // get company 
    const company = await Company.findOne({_id: user.company});
    
    if (!company) {
        return res.status(400).json({
            message: "Company not found"
        });
    }

    // get stripe customer
    const customer = await GetOrCreateStripeCustomer(company);
    if (!customer) {
        return res.status(400).json({
            message: "Stripe customer not found"
        });
    }

    // get payment methods
    const stripe = getStripe();
    const paymentMethods = await stripe.paymentMethods.detach(payment_method_id);
    

    return res.json({
        message: "Payment method removed"
    });
}