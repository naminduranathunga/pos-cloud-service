import { Request, Response } from "express";


export default function initiate_payment_for_the_invoice(req: Request, res: Response){
    return res.status(200).json({
        message: "Payment initiated successfully"
    });
}