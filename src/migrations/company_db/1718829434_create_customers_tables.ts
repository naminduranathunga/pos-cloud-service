

export default async function up(conn: any) {
    return await conn.query(`
        CREATE TABLE customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(30) NOT NULL UNIQUE, 
            address TEXT,
            is_active BOOLEAN NOT NULL DEFAULT TRUE
        )
    `);
}

export async function down(conn: any) {
    //return conn.query(``);
    return conn.query(`
        DROP TABLE customers
    `);
}
