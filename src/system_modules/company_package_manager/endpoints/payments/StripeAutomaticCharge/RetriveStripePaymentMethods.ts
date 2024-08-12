import { Request, Response } from "express";
import { check_user_permission } from "../../../../../modules/app_manager";
import Company from "../../../../../schemas/company/company_scema";
import GetOrCreateStripeCustomer from "../../../functions/StripeAutopay/GetOrCreateStripCustomer";
import getStripe from "../../../functions/Checkout/GetStripe";


export default async function stripe_retrive_payment_methods(req: Request, res: Response){
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
    const paymentMethods = await stripe.paymentMethods.list({
        customer: customer.id,
        type: "card"
    });

    interface PaymentMethod {
        id: string;
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
    }
    const paymentMethodsData: PaymentMethod[] = paymentMethods.data.map((method: any) => {
        return {
            id: method.id,
            brand: method.card?.brand,
            last4: method.card?.last4,
            exp_month: method.card?.exp_month,
            exp_year: method.card?.exp_year
        }
    });

    return res.json({
        paymentMethods: paymentMethodsData
    });
}