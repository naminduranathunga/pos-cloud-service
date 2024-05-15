import { Request, Response } from "express";



export default async function get_product_thumbnail(req: Request, res: Response) {
    //const user = req.user;
    
    //if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    const image_file = req.query.image_file as string;

    if (!image_file) return res.status(400).json({message: "Image file is required"});

    const upload_path = process.env.UPLOADS_DIR || 'uploads';
    const path = require('path');
    const full_path = path.join(upload_path, image_file);
    try {
        // check if file exists
        
        const fs = require('fs');
        console.log(full_path);
        if (!fs.existsSync(full_path)) return res.status(404).json({message: "File not found"});

        res.sendFile(full_path, {root: '.'});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error"});
    }
}