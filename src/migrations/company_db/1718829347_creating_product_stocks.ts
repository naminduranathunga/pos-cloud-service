
export default async function up(conn: any) {
    return await conn.query(`
        CREATE TABLE product_stocks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            branch_id VARCHAR(255),
            product_id INT,
            quantity INT NOT NULL DEFAULT 0,
            sale_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,

            foreign key (product_id) references products(id)
        )
    `);
}

export async function down(conn: any) {
    return conn.query(`
        DROP TABLE product_stocks
    `);
}