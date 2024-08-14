
export default async function up(conn: any) {
    return await conn.query(`
        CREATE TABLE product_barcodes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT,
            barcode VARCHAR(255) NOT NULL,
            foreign key (product_id) references products(id)
        )
    `);
}

export async function down(conn: any) {
    return conn.query(`
        DROP TABLE products
    `);
}