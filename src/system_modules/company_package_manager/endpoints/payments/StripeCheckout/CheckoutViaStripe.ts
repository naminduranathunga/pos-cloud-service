import { Request, Response } from "express";
import CustomerInvoice from "../../../../../schemas/company/customer_invoice_schema";
import mongoose from "mongoose";
const stripe = require('stripe')('sk_test_51PCmnvRwhVEyiTahrp5wMJGq6Ikbq1LaYgWjQWYE6SWkhEFHFdrGR2XIGnKNe369xOb5E0upzF4xj4MZFxp1ZQgN00SM1p7ZVE');


export default async function checkout_invoice_via_stripe(req: Request, res: Response){
    const {invoice_id, url} = req.query as {invoice_id: string, url: string};

    if (!invoice_id || !mongoose.Types.ObjectId.isValid(invoice_id)) {
        return res.status(400).json({
            message: "invoice_id is required",
            invoice_id
        });
    }

    const invoice = await CustomerInvoice.findOne({_id: mongoose.Types.ObjectId.createFromHexString(invoice_id)});
    if (!invoice) {
        return res.status(400).json({
            message: "Invoice not found"
        });
    }

    // check if invoice is already paid 
    if (invoice.isPaid) {
        return res.status(400).json({
            message: "Invoice is already paid"
        });
    }

    // check if invoice has checkout session
    if (invoice.customOptions && invoice.customOptions.checkoutSession) {
        // check if session is valid
        const session = await stripe.checkout.sessions.retrieve(invoice.customOptions.checkoutSession);
        if (session && session.status === "open") {
            return res.json({
                url: session.url,
                message: "Checkout session already exists"
            });
        }
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'LKR',
                    product_data: {
                        name: invoice.invoiceNumber,
                    },
                    unit_amount: invoice.totalAmount * 100, // convert to cents
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${url}?success=true`,
        cancel_url: url,
    });

    invoice.customOptions = invoice.customOptions || {};
    invoice.customOptions.checkoutSession = session.id;
    invoice.markModified("customOptions");
    await invoice.save();

    return res.status(200).json({
        url: session.url,
        message: "Payment initiated successfully"
    });
}