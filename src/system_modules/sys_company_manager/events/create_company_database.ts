import create_company_db from "../funtions/create_company_db";

export default async function create_company_database_on_creating_company({company}:{company:any}){
    await create_company_db(company);
}