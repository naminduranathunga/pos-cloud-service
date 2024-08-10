import { Request, Response } from "express";


export default function webhook_payment_complete_and_successfull(req: Request, res: Response){
    return res.status(200).json({
        message: "Payment initiated successfully"
    });
}