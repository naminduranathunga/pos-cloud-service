import ConnectMongoDB from "./connect_mongodb";
import ConnectMySQL from "./connect_sql_server";


export default async function system_check() {
    await check_connections();
}

export async function check_connections() {
    console.log('Checking connections...');
    console.log('Checking MongoDB connection...');
    try {
        await ConnectMongoDB()
    } catch (error) {
        console.error('Error connecting to MongoDB');
        if (process.env.DEBUG == 'true') console.error(error);
        throw error;     
    }

    console.log('Checking MySQL connection...');
    try {
        await ConnectMySQL()
    } catch (error) {
        console.error("\x1b[31mError connecting to MySQL\x1b[0m");
        if (process.env.DEBUG == 'true') console.error(error);
        throw error;     
    }
    console.log("\x1b[32mAll services are up and running.\x1b[0m]")
}