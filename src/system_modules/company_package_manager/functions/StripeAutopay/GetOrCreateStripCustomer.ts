/**
 * This function will get or create a stripe customer
 */

import getStripe from "../Checkout/GetStripe";

export default async function GetOrCreateStripeCustomer(company: any) {
    const stripe = getStripe();

    if (company?.company_data?.stripeCustomerId) {
        const customer = await stripe.customers.retrieve(company.company_data.stripeCustomerId);    
        if (customer) {
            return customer;
        }
    }

    // create stripe customer
    const customer = await stripe.customers.create({
        email: company.email,
        name: company.name,
    })

    if (customer) {
        // company.company_data a map<string, string>
        if (!company.company_data) {
            company.company_data = {};
        }
        company.company_data.stripeCustomerId = customer.id;
        console.log("company", company);
        console.log("company", company.company_data.stripeCustomerId);
        console.log("company", customer.id);
        company.markModified("company_data");
        await company.save();
        return customer;
    }

    return null;
}