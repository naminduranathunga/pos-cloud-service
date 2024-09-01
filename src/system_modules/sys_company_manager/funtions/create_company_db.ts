
import { encrypt_company_db_password, genetate_new_company_db_password } from "../../../lib/company_db_passwords";
import ConnectMySQL from "../../../lib/connect_sql_server";
import { migrate_company_db } from "../../../migrations/migrate_company_db";

function generate_username(company:any){
    // max length of username is 30
    return company.name.toLowerCase().replace(/\s/g, "_").substring(0, 24);
}


export default async function create_company_db(company:any) {
    const conn = await ConnectMySQL(false);
    
    // create a new database, user, and password
    let database = "db_" + generate_username(company);
    let username = "user_" + generate_username(company);
    const password = genetate_new_company_db_password();
    const encrypted_password = encrypt_company_db_password(password);
    console.log(`Creating database ${database} for company ${username} pqssword: ${password}`);

    // we need a unique db name
    let sql = `show databases LIKE "${database}";`;
    let [rows] = await conn.query<any[]>(sql);
    let n = 0;
    while (rows.length > 0){
        n++;
        sql = `show databases LIKE "${database}_${n}";`;
        [rows] = await conn.query<any[]>(sql);
    }
    if (n > 0){
        database += `_${n}`;
    }


    // create the database
    await conn.query(`START TRANSACTION`);
    await conn.query(`CREATE DATABASE ${database}`);
    await conn.query(`use ${database}`);
    await conn.query(`CREATE USER '${username}'@'%' IDENTIFIED BY ?`, [password]);
    await conn.query(`GRANT ALL PRIVILEGES ON ${database}.* TO '${username}'@'%'`);
    await conn.query(`FLUSH PRIVILEGES`);
    await conn.query(`COMMIT`);

    company.company_database = {
        name: database,
        username,
        password: encrypted_password,
        host: "localhost"
    }
    company.markModified("company_database");
    await company.save();  

    // migrate the database
    await migrate_company_db(database);
}