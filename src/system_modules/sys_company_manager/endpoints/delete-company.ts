import { Request, Response } from "express";
import mongoose from "mongoose";
import mysql from "mysql2/promise";
import Company from "../../../schemas/company/company_scema";
import { check_user_permission } from "../../../modules/app_manager";
import dotenv from "dotenv";

dotenv.config();

// Example models for related collections
import Branch from "../../../schemas/company/branches_schema";
import CustomerInvoice from "../../../schemas/company/customer_invoice_schema";
import User from "../../../schemas/company/user_schema";

export default async function delete_company(req: Request, res: Response) {
    const user = req.user;
    const { _id } = req.body;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the user has permission to delete the company
    if (!check_user_permission(user, 'delete_company') && !check_user_permission(user, 'company-admin')) {
        return res.status(403).json({ message: 'No permissions' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the company by ID
        const company = await Company.findById(_id).session(session);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const companyName = company.name;  // Ensure this exists and is accessible

        // Delete all related entries that contain the company ID
        await deleteRelatedEntries(_id, session);

        // Delete the SQL database and user associated with the company
        await deleteSQLDatabaseAndUser(companyName);

        // Delete the company document itself
        await Company.deleteOne({ _id }).session(session);

        await session.commitTransaction();
        return res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        console.error("Error during company deletion:", error);  // Log the full error
        await session.abortTransaction();
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        session.endSession();
    }
}

// Function to delete related entries
async function deleteRelatedEntries(companyId: string, session: mongoose.ClientSession) {
    try {
        await Branch.deleteMany({ companyId }).session(session);
        await CustomerInvoice.deleteMany({ companyId }).session(session);
        await User.deleteMany({ companyId }).session(session);
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

// Function to delete the SQL database and user
async function deleteSQLDatabaseAndUser(companyName: string | unknown): Promise<void> {
    const dbName = `db_${companyName}`;
    const userName = `user_${companyName}`;

    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,  // Use your MySQL root or administrative username
            password: process.env.MYSQL_PASSWORD,  // Use your MySQL root password
        });

        await connection.execute(`DROP DATABASE IF EXISTS \`${dbName}\``);
        await connection.execute(`DROP USER '${userName}'@'%'`);

        await connection.end();
    } catch (error) {
        console.error("Error deleting SQL database or user:", error);  // Log the full error
        throw new Error(`Error deleting SQL database or user: ${error.message}`);
    }
}
