/**
 * Here we migrate company databases 
 * 
 */

import ConnectMySQL from "../lib/connect_sql_server";
import fs from 'fs';
import path from 'path';

function get_migration_files(){
    const dir = path.join(__dirname, 'company_db');
    const files = fs.readdirSync(dir);
    files.sort();
    console.log(files);
    return files.filter(file => file.endsWith('.js'));
}


export async function migrate_company_db(dbname:string){
    const conn = await ConnectMySQL();

    await conn.query(`use ${dbname}`);
    await conn.query(`CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // get list of migrations
    const [rows] = await conn.query<any[]>(`SELECT * FROM migrations`);
    const migrations = rows.map(row => row.name);

    // get list of migration files
    const files = get_migration_files();
    for (let i = 0; i < files.length; i++){
        const file = files[i];
        if (migrations.includes(file)){
            continue;
        }

        console.log(`Running migration ${file}`);
        const migration = require(path.join(__dirname, 'company_db', file));
        await migration.default(conn);
        console.log(`Migration ${file} completed`);
        await conn.query(`INSERT INTO migrations (name) VALUES (?)`, [file]);
        console.log(`Migration ${file} saved to migrations table`);
    }
}

export async function rollback_company_db(dbname:string, rollback_count?:number){
    const conn = await ConnectMySQL();

    await conn.query(`use ${dbname}`);

    // get list of migrations
    const [rows] = await conn.query<any[]>(`SELECT * FROM migrations ORDER BY id DESC ${rollback_count?`LIMIT ${rollback_count}`:''}`);
    const migrations = rows.map(row => row.name);

    for (let i = 0; i < migrations.length; i++){
        const migration = migrations[i];
        console.log(`Rolling back migration ${migration}`);
        const rollback = require(path.join(__dirname, 'company_db', migration));
        // start transaction
        await conn.query(`START TRANSACTION`);
        try {
            await rollback.down(conn);
            console.log(`Rollback ${migration} completed`);
            await conn.query(`DELETE FROM migrations WHERE name = ?`, [migration]);
            console.log(`Migration ${migration} deleted from migrations table`);
            await conn.query(`COMMIT`);
        } catch (error) {
            await conn.query(`ROLLBACK`);
            console.log(`Rollback ${migration} failed`);
            throw error;
        }
    }
}