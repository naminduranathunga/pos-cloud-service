

export default async function up(conn: any) {
    //return await conn.query(``);
    await conn.query(`
        CREATE TABLE gtn (
            id INT AUTO_INCREMENT PRIMARY KEY,
            branch_id VARCHAR(255),
            gtn_no VARCHAR(255) NOT NULL,
            gtn_date DATE NOT NULL,
            from_branch_id VARCHAR(255),
            to_branch_id VARCHAR(255),
            notes TEXT,
            is_active BOOLEAN NOT NULL DEFAULT TRUE
        )
    `);

    await conn.query(`
        CREATE TABLE gtn_products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            gtn_id INT NOT NULL,
            product_id INT,
            quantity INT NOT NULL DEFAULT 0,
            cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            sale_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,

            foreign key (gtn_id) references gtn(id),
            foreign key (product_id) references products(id)
        );
    `);
}

export async function down(conn: any) {
    //return conn.query(``);
    await conn.query(`
        DROP TABLE gtn_products
    `);
    await conn.query(`
        DROP TABLE gtn
    `);
}
