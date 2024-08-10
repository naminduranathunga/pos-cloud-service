import { Request, Response } from "express";
import mongoose from "mongoose";
import CustomerInvoice from "../../../../../schemas/company/customer_invoice_schema";
import { PayhereCheckoutFormInterface } from "../../../interfaces/Payhere";
import Company from "../../../../../schemas/company/company_scema";
import { check_user_permission } from "../../../../../modules/app_manager";
import {createHash } from 'crypto';
import md5 from 'crypto-js/md5';

// hash = to_upper_case(md5(merchant_id + order_id + amount + currency + to_upper_case(md5(merchant_secret))))
const generateMD5Hash = (order_id:string, amount:string, currency:string) =>{
    const merchant_id = process.env.PAYHERE_MERCHANT_ID||"";
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET||"";
    let hashedSecret    = md5(merchant_secret).toString().toUpperCase();
    let amountFormated  = parseFloat( amount ).toLocaleString( 'en-us', { minimumFractionDigits : 2 } ).replace(',', '');
    console.log(merchant_id + order_id + amountFormated + currency + hashedSecret);
    return md5(merchant_id + order_id + amountFormated + currency + hashedSecret).toString().toUpperCase();
}
// hash = to_upper_case(md5(merchant_id + order_id + amount + currency + to_upper_case(md5(merchant_secret))))
/*const generateMD5Hash = (order_id:string, amount:string, currency:string) =>{
    const merchant_id = process.env.PAYHERE_MERCHANT_ID||"";
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET||"";
    const hashed_ms = createHash("md5").update(merchant_secret).digest("hex").toUpperCase();
    const str_ = `${merchant_id}${order_id}${amount}.00${currency}${hashed_ms}`;
    console.log(str_);
    return createHash("md5").update(str_).digest("hex").toUpperCase();
}*/

export default async function get_payment_checkout_form(req: Request, res: Response){
    const user = req.user;
    if (!check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    const {invoice_id} = req.query as {invoice_id: string};
    if (!invoice_id) {
        return res.status(400).json({
            message: "invoice_id is required"
        });
    }
    if (!mongoose.Types.ObjectId.isValid(invoice_id)) {
        return res.status(400).json({
            message: "Invalid invoice_id"
        });
    }
    const invoice = await CustomerInvoice.findOne({_id: mongoose.Types.ObjectId.createFromHexString(invoice_id)});
    if (!invoice) {
        return res.status(404).json({
            message: "Invoice not found"
        });
    }
    const company = await Company.findOne({_id: mongoose.Types.ObjectId.createFromHexString(user.company)})
    if (!company) {
        return res.status(404).json({
            message: "Company not found"
        });
    }


    let paymentForm:PayhereCheckoutFormInterface = {
        action: process.env.PAYHERE_CHECKOUT_URL||"",
        merchant_id: process.env.PAYHERE_MERCHANT_ID||"",
        return_url: "",
        cancel_url: "",
        notify_url: "https://flexaro.net/checkout/payhere/notify",
        first_name: company.name as string,
        last_name: "Test",
        email: company.email as string,
        phone: (company.phone.length > 0)?company.phone[0]:"",
        address: company.address as string,
        city: "Gampaha",
        country: "Sri Lanka",
        order_id: invoice._id.toHexString(),
        items: invoice.invoiceNumber,
        currency: "LKR",
        amount: invoice.dueAmount.toString(),
        hash: generateMD5Hash(invoice._id.toHexString(), invoice.dueAmount.toString(), "LKR")
    }
    return res.status(200).json(paymentForm);
}