import { Request, Response } from "express";
import { check_user_permission } from "../../../../../modules/app_manager";
import Company from "../../../../../schemas/company/company_scema";
import GetOrCreateStripeCustomer from "../../../functions/StripeAutopay/GetOrCreateStripCustomer";
import getStripe from "../../../functions/Checkout/GetStripe";

/**
 * @see https://docs.stripe.com/payments/save-and-reuse?platform=web&ui=elements&client=react
 * 
 */
export default async function stripe_add_payment_method(req: Request, res: Response){
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


    // setup Intent
    const stripe = getStripe();
    const intentsAvailable = await stripe.setupIntents.list({
        customer: customer.id
    });
    if (intentsAvailable && intentsAvailable.data.length > 0) {
        const intent = intentsAvailable.data.find((intent) => intent.status === "requires_action" || intent.status === "requires_payment_method");
        if (intent) {       
            return res.json({
                client_secret: intent.client_secret,
            });
        }
    }

    // create intent
    const intent = await stripe.setupIntents.create({
        customer: customer.id,
        automatic_payment_methods: {
            enabled: true,
        }
    });

    if (intent) {
        return res.json({
            client_secret: intent.client_secret
        });
    }

    return res.status(400).json({
        message: "Error creating payment intent"
    });

}
