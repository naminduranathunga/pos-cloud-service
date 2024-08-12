import getStripe from "../Checkout/GetStripe";


export default async function stripePayAutoInvoices(invoices:any[]) {
    const stripe = getStripe();

    Promise.all(invoices.map(async (invoice:any)=>{
        invoice.autoReccuringPaymentAttempts += 1;
        const company_data = invoice.company_id?.company_data || {};

        try {
            if (company_data?.automaticPayment !== true || !(company_data?.stripeCustomerId)){
                throw new Error(`Automatic payment attempt failed. Attempt ${invoice.autoReccuringPaymentAttempts}`);
            }
    
            const stripeCustomer = await stripe.customers.retrieve(company_data?.stripeCustomerId);
            if (!stripeCustomer){
                throw new Error(`Automatic payment attempt failed. Attempt ${invoice.autoReccuringPaymentAttempts}`);
            }

            //const paymentMethod
        } catch (error) {
            invoice.paymentNotes = (invoice.paymentNotes||"") + `${error.message}\n`;
        }
        return await invoice.save();
        
    }))
    
}