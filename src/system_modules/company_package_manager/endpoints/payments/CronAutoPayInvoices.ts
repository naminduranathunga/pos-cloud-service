import { Request, Response } from "express";
import CustomerInvoice from "../../../../schemas/company/customer_invoice_schema";
import stripePayAutoInvoices from "../../functions/StripeAutopay/stripePayAutoInvoices";


export default async function cron_auto_pay_invoices(req: Request, res: Response){
    const cron_secret = req.headers["corn-secret"];
    if (cron_secret !== process.env.CRON_SECRET) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    
    // get unpaid invoices
    const invoices = await CustomerInvoice.find({
        isPaid: false,
        autoReccuringPayment: true,
        autoReccuringPaymentAttempts: { $lt: 3 }
    }).populate({
        path:"company_id",
        select: [
            "_id", "name", "company_data", "email"
        ]
    });

    invoices.forEach(async (invoice)=>{
        invoice.autoReccuringPaymentAttempts += 1;
        await invoice.save();
    })
    //await stripePayAutoInvoices(invoices);

    return res.json({
        message: "Cron job initiated",
        invoices
    });
}