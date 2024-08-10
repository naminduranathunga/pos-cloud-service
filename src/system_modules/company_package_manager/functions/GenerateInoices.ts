import CustomerInvoice from "../../../schemas/company/customer_invoice_schema";
import { CompanySubscription } from "../interfaces/CompanySubscription";
import { CustomerUsageInvoice } from "../interfaces/CustomerUsageInvoice";
import GetNextInvoiceNumber from "./GetNextInvoiceNumber";



export default async function GenerateInvoices(company: any){

    if (typeof company.subscription === "undefined") {
        //throw new Error("Company has no subscription");
        return;
    }

    // generate invoice
    const subscription = company.subscription as CompanySubscription;

    if (typeof subscription.nextInvoicingDate !== "undefined" && subscription.nextInvoicingDate > new Date()) {
        //throw new Error("Next invoicing date is not reached yet");
        return;
    }

    let lastInvoiceNumber = 0;

    const invoice:CustomerUsageInvoice = {
        invoiceNumber: GetNextInvoiceNumber(),
        company_id: company._id,
        totalAmount: subscription.packagePrice,
        paidAmount: 0,
        dueAmount: subscription.packagePrice,
        invoiceDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        isPaid: false,
        autoReccuringPayment: false,
        autoReccuringPaymentAttempts: 0,
        invoiceItems: [{
            name: subscription.packageName,
            quantity: 1,
            unitPrice: subscription.packagePrice,
            total: subscription.packagePrice
        }]
    }

    const customerInvoice = new CustomerInvoice(invoice);
    await customerInvoice.save();
    
    if (typeof subscription.nextInvoicingDate === "undefined") {
        company.subscription.nextInvoicingDate = new Date(new Date().setDate(new Date().getDate() + 30));
    } else {
        company.subscription.nextInvoicingDate = new Date(subscription.nextInvoicingDate.setDate(subscription.nextInvoicingDate.getDate() + 30));
    }
    company.subscription = subscription;
    company.markModified("subscription");
    await company.save();
    
}