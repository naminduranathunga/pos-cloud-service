/**
 * Check wheather user is logged in or not
 */

import { Request, Response } from "express";

export default async function validate_user_token(req: Request, res: Response) {
    // this is a protected endpoint
    // sso, if we came here, means user is logged in and token is valid
    return res.status(200).json({messge: "User is logged in"});
}