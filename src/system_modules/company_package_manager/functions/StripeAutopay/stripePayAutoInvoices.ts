import getStripe from "../Checkout/GetStripe";


export default async function stripePayAutoInvoices(invoices:any[]) {
    const stripe = getStripe();

    Promise.all(invoices.map(async (invoice:any)=>{
        console.log("Auto Pay Invoice no: " + invoice.invoiceNumber);
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
            //const paymentMethod ccc
            const paymentMethods = await stripe.paymentMethods.list({
                customer: stripeCustomer.id,
                type: 'card'
            });

            if (paymentMethods.data.length === 0){
                throw new Error(`Automatic payment attempt failed. Attempt ${invoice.autoReccuringPaymentAttempts}. No payment method.`);
            }

            for (let i = 0; i < paymentMethods.data.length; i++){
                const method = paymentMethods.data[0];
                
                try {
                    const paymentIntent = await stripe.paymentIntents.create({
                        amount: invoice.totalAmount * 100, // convert to cents
                        customer: stripeCustomer.id,
                        payment_method: method.id,
                        currency: 'lkr',
                        // return_url: "",
                        automatic_payment_methods: {enabled: true},
                        off_session: true,
                        confirm: true,
                    });
                    //console.log(paymentIntent);
                    if (paymentIntent.status === "succeeded"){
                        invoice.isPaid = true;
                        invoice.paymentDate = new Date();
                        invoice.paymentMethod = "CARD - AUTOMATIC PAYMENTS";
                        invoice.paymentReference = paymentIntent.id;
                        invoice.paidAmount = paymentIntent.amount_received / 100;
                        break;
                    } else if (paymentIntent.status === "processing"){
                        invoice.paymentNotes = "Payment in processing";
                        break;
                    } else {
                        invoice.paymentNotes = "Payment failed with status " + paymentIntent.status;
                        break;
                    }
                } catch (error) {
                    console.log(error);
                    continue;
                }
                break; // assume the payment is initiated
            }
            
        } catch (error) {
            invoice.paymentNotes = (invoice.paymentNotes||"") + `${error.message}\n`;
        }
        return await invoice.save();
        
    }))
    
}