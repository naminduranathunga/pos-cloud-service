import mysql from 'mysql2/promise';
import { decrypt_company_db_password } from './company_db_passwords';

const ConnectMySQL = async (with_db=true, multipleStatements=false) =>{
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const database = process.env.MYSQL_DB_NAME || 'database';
    const port = parseInt(process.env.MYSQL_PORT) || 3306;
    const host = process.env.MYSQL_HOST || 'localhost';

    console.log(`Connecting to MySQL: ${user}@${host}:${port}/${database}`);
    let connection:mysql.Connection;
    if (with_db){
        connection = await mysql.createConnection({
            host,
            user,
            password,
            database,
            port,
            multipleStatements,
        });
    } else {
        connection = await mysql.createConnection({
            host,
            user,
            password,
            port,
            multipleStatements,
        });
    }
    return connection;
}

export default ConnectMySQL;


export const ConnectMySQLCompanyDb = async (company:any, multipleStatements=false) => {
    const user = company.company_database?.username;
    const enc_password = company.company_database?.password;
    const database = company.company_database?.name;
    const password = decrypt_company_db_password(enc_password);

    const port = parseInt(process.env.MYSQL_PORT) || 3306;
    const host = process.env.MYSQL_HOST || 'localhost';
    const connection = mysql.createConnection({
        host,
        user,
        password,
        database,
        port,
        multipleStatements,
    });

    return connection;
}
