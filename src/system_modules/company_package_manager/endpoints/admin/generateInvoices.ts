import { Request, Response } from "express";
import ConnectMongoDB from "../../../../lib/connect_mongodb";
import Company from "../../../../schemas/company/company_scema";
import GenerateInvoices from "../../functions/GenerateInoices";



export async function cron_generate_invoices(req:Request, res: Response){

    // cron secret validation
    const cron_secret = req.headers["corn-secret"];
    if (cron_secret !== process.env.CRON_SECRET) {
        return res.status(401).json({
            message: "Unauthorized s",
            "sc": cron_secret,
            "ps": process.env.CRON_SECRET,
            "headers": req.headers
        });
    }

    // Get all active companies
    await ConnectMongoDB();
    const companies = await Company.find({isActive: true});

    // iterate through the companies and generate invoices
    for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        await GenerateInvoices(company);
    }

    return res.status(200).json({
        message: "Invoices generated successfully",
        count: companies.length
    });
}