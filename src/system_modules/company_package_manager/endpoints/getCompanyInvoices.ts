import { Request, Response } from "express";
import { check_user_permission } from "../../../modules/app_manager";
import ConnectMongoDB from "../../../lib/connect_mongodb";
import mongoose from "mongoose";
import Company from "../../../schemas/company/company_scema";
import CustomerInvoice from "../../../schemas/company/customer_invoice_schema";



export default async function get_company_invoices(req:Request, res:Response){
    const user = req.user;
    // permission validation
    // only super-admins
    let {company_id, filterDateFrom, filterDateTo, filterStatus, invoiceId } = req.query as {company_id: string, filterStatus?: "all"|"paid"|"unpaid", filterDateFrom?: string, filterDateTo?: string, invoiceId?: string};
    
    if (!company_id){
        company_id = user.company;
    }

    if (!check_user_permission(user, "system-administration")) {
        if (!check_user_permission(user, "company-admin") || user.company.toString() !== company_id) {
            res.status(403).json({
                "message": "No permissions"
            });
            return;
        }
    }

    
    try {
        await ConnectMongoDB();
        const comp_id = mongoose.Types.ObjectId.createFromHexString(company_id);
        const company = await Company.findOne({_id: comp_id});

        const args:any = {
            company_id: comp_id,
        }
        if (filterStatus && filterStatus === "paid") {
            args.isPaid = true;
        }
        if (filterStatus && filterStatus === "unpaid") {
            args.isPaid = false;
        }
        if (invoiceId && mongoose.Types.ObjectId.isValid(invoiceId)) {
            args._id = mongoose.Types.ObjectId.createFromHexString(invoiceId);
        }

        if (filterDateFrom) {
            if (filterDateTo) {
                args.invoiceDate = {
                    $gte: new Date(filterDateFrom),
                    $lte: new Date(filterDateTo)
                }
            } else {
                args.invoiceDate = {
                    $gte: new Date(filterDateFrom)
                }
            }
        }

        const count = await CustomerInvoice.countDocuments(args);
        const invoices = await CustomerInvoice.find(args);
        return res.status(200).json({
            message: "Invoices fetched successfully",
            total:count,
            invoices
        });

        return res.status(200).json({
            message: "Subscription added successfully",
            subscription: company.subscription||{}
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
}