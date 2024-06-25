

export default async function up(conn: any) {
   await conn.query(`
        CREATE TABLE grn (
            id INT AUTO_INCREMENT PRIMARY KEY,
            branch_id VARCHAR(255),
            vendor_id INT,

            grn_no VARCHAR(255) NOT NULL,
            grn_date DATE NOT NULL,

            invoice_no VARCHAR(255),
            invoice_date DATE,
            invoice_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            adjustment DECIMAL(10,2) NOT NULL DEFAULT 0.00,

            notes TEXT,

            is_active BOOLEAN NOT NULL DEFAULT TRUE,

            foreign key (vendor_id) references vendors(id)
        )
    `);

    return await conn.query(`
        CREATE TABLE grn_products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            grn_id INT NOT NULL,
            product_id INT,
            quantity INT NOT NULL DEFAULT 0,
            cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            sale_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,

            foreign key (grn_id) references grn(id),
            foreign key (product_id) references products(id)
        )
    `);
}

export async function down(conn: any) {
    //return conn.query(``);
    await conn.query(`
        DROP TABLE grn_products
    `);
    await conn.query(`
        DROP TABLE grn
    `);
}
