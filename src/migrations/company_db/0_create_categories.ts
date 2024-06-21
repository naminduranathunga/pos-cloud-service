
export default async function up(conn: any) {
    return await conn.query(`
        CREATE TABLE categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            parent_id INT,

            foreign key (parent_id) references categories(id)
        )
    `);
}

export async function down(conn: any) {
    return conn.query(`
        DROP TABLE categories
    `);
}