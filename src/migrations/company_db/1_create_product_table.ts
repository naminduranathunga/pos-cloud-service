
export default async function up(conn: any) {
    return await conn.query(`
        CREATE TABLE products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            sku VARCHAR(255) NOT NULL,
            thumbnail VARCHAR(255),
            inventory_type VARCHAR(25) NOT NULL DEFAULT "nos",
            size VARCHAR(25),
            weight DECIMAL(10,3),
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            category_id INT,

            foreign key (category_id) references categories(id)
        )
    `);
}

export async function down(conn: any) {
    return conn.query(`
        DROP TABLE products
    `);
}