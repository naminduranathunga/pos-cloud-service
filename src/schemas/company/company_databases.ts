import mongoose, { Schema } from "mongoose";
/**
 * Each company has a database on SQL. this will store data regarding it.
 */

const CompanyDBSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    pasasword: {
        type: String,
        required: true, // encrypted password
    },
    migrations: {
        type: String,
        required: true
    },
    company: {

    }
});

const CompanyDB = mongoose.model('CompanyDatabases', CompanyDBSchema);

export default CompanyDB;
