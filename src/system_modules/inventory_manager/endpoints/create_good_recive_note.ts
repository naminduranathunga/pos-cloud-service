import { Request, Response } from 'express';

export default async function create_good_recive_note(req: Request, res: Response) {
    res.status(200).json({message: 'Good Recive Note Created'});
}