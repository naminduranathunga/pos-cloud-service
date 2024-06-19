import { createConnection } from 'mysql';

const ConnectMySQL = async () =>{
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || 'password';
    const database = process.env.MYSQL_DATABASE || 'database';
    const port = parseInt(process.env.MYSQL_PORT) || 3306;
    const host = process.env.MYSQL_HOST || 'localhost';

    const connection = createConnection({
        host,
        user,
        password,
        database,
        port,
    });

    connection.connect();
    return connection;
}

export default ConnectMySQL;


export const ConnectMySQLCompanyDb = async (user, password, database) => {
    const port = parseInt(process.env.MYSQL_PORT) || 3306;
    const host = process.env.MYSQL_HOST || 'localhost';
    const connection = createConnection({
        host,
        user,
        password,
        database,
        port,
    });

    connection.connect();
    return connection;
}
