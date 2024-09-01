

export default async function up(conn: any) {
    //return await conn.query(``);
    await conn.query(`
        CREATE TABLE sales_notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sales_note_no VARCHAR(255) NOT NULL,
            branch_id VARCHAR(255),

            customer_id INT,
            sales_person_id VARCHAR(255),
            sale_date DATE NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            adjustment DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,

            payment_method VARCHAR(25),
            payment_status VARCHAR(25),

            sales_order_id INT,
            custom_fields JSON,
            notes TEXT,
            status VARCHAR(25) NOT NULL DEFAULT 'draft',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            foreign key (customer_id) references customers(id) on delete set null
        )
    `);
    await conn.query(`
        CREATE TABLE sales_note_products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sales_note_id INT NOT NULL,
            product_id INT,
            quantity INT NOT NULL DEFAULT 0,
            sale_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            
            foreign key (sales_note_id) references sales_orders(id) on delete cascade,
            foreign key (product_id) references products(id) on delete set null
        )
    `);

    
}

export async function down(conn: any) {
    //return conn.query(``);
    await conn.query(`DROP TABLE sales_note_products`);
    await conn.query(`DROP TABLE sales_notes`);
}
