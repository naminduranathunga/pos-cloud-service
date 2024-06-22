

export default async function up(conn: any) {
    await conn.query(`
        CREATE TABLE sales_returns (
            id INT AUTO_INCREMENT PRIMARY KEY,
            branch_id VARCHAR(255),
            customer_id INT,
            return_no VARCHAR(255) NOT NULL,
            return_date DATE NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            adjustment DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            payment_method VARCHAR(25),
            notes TEXT,

            foreign key (customer_id) references customers(id)
        )
    `);
    await conn.query(`
        CREATE TABLE sales_return_products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sales_return_id INT NOT NULL,
            product_id INT,
            quantity INT NOT NULL DEFAULT 0,
            sale_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,

            foreign key (sales_return_id) references sales_returns(id),
            foreign key (product_id) references products(id)
        )
    `);
}

export async function down(conn: any) {
    //return conn.query(``);
    await conn.query(`
        DROP TABLE sales_return_products
    `);
    await conn.query(`
        DROP TABLE sales_returns
    `);
}
