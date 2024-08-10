import CustomerInvoice from "../../../../schemas/company/customer_invoice_schema";
import getStripe from "./GetStripe";


export default async function StripeHandleSessionComplete(session_id:string) {
    // {"customOptions.checkoutSession":"cs_test_a1pLi1bv4I5IuYmDK0Bc87VrMdepHUAx3UIUibz2vXLZR83SrkOPNyH8Ag"}
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const args = {
        "customOptions.checkoutSession": session_id
    }
    // get invoice
    const invoice = await CustomerInvoice.findOne(args);
    if (!invoice) {
        throw new Error("Invoice not found");
    }

    if (session.payment_status === "paid"){
        const amount = Math.floor(session.amount_total / 100);
        invoice.isPaid = true;
        invoice.paidAmount = amount;
        invoice.dueAmount = 0;
        invoice.paymentDate = new Date();
        invoice.paymentMethod = "Stripe";
        invoice.paymentNotes = "Payment completed successfully";
        invoice.paymentReference = session.payment_intent.toString();

        await invoice.save();
    }
}