import { Request, Response } from "express";
import { AuthenticatedUser } from "../../../../interfaces/jwt_token_user";
import { check_user_permission } from "../../../../modules/app_manager";
import Product from "../../../../schemas/product/product_schema";
import multer from "multer";
import sharp from "sharp";

/**
 * Unlike  normal requests, this uses multer for parsing the body
 * for multipart form-data
 */
export const add_thumbnail_upload_multer = multer({
    dest: process.env.UPLOADS_DIR || 'uploads/',
    limits: {
        fileSize: parseInt(process.env.PRODUTCT_THUMBNAIL_MAX_SIZE) * 1024 || 1024 * 1024,
    },
    storage: multer.memoryStorage()
}).single('thumbnail');

export default async function add_thumbnail_for_product(req: Request, res: Response) {
    const user = req.user;
    
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    if (!check_user_permission(user, "create_product") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    const {product_id} = req.body as {product_id: string};
    const thumbnail = req.file;


    // validate request
    if (!product_id) return res.status(400).json({message: "Product ID is required"});
    if (!thumbnail) return res.status(400).json({message: "Thumbnail is required"});
    /*
    {
  fieldname: 'thumbnail',
  originalname: 'slack.png',
  encoding: '7bit',
  mimetype: 'image/png',
  buffer: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 02 00 00 00 02 00 08 06 00 00 00 f4 78 d4 fa 00 00 00 04 73 42 49 54 08 08 08 08 7c 08 64 88 00 ... 17305 more bytes>,
  size: 17355
}*/
    // convert image to webp and save it

    const product = await Product.findOne({company: user.company, _id: product_id});
    if (!product) return res.status(400).json({message: "Product does not exist"});

    // save the thumbnail
    // <product_id><timestamp>.webp
    const thumbnail_file_name = `product_thumbnails/${product_id}_${Date.now()}.webp`;
    const upload_path = process.env.UPLOADS_DIR || 'uploads';
    const full_path = `${upload_path}/${thumbnail_file_name}`;
    sharp(thumbnail.buffer).toFile(full_path);
    
    product.thumbnail = thumbnail_file_name;
    await product.save();

    return res.status(200).json({message: "Thumbnail added successfully"});
}