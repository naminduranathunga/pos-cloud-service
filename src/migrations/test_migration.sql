START TRANSACTION;
CREATE DATABASE db_test_company;
use db_test_company;


CREATE USER 'user_test_company'@'%' IDENTIFIED BY 'password_test_company';
GRANT ALL PRIVILEGES ON db_test_company.* TO 'user_test_company'@'%';
FLUSH PRIVILEGES;

COMMIT;


START TRANSACTION;

CREATE TABLE 'categories' (
    'id' INT AUTO_INCREMENT PRIMARY KEY,
    'name' VARCHAR(255) NOT NULL,
    'parent_id' INT,

    foreign key (parent_id) references categories(id)
);

CREATE TABLE 'products' (
    'id' INT AUTO_INCREMENT PRIMARY KEY,
    'name' VARCHAR(255) NOT NULL,
    'sku' VARCHAR(255) NOT NULL UNIQUE,
    'thumbnail' VARCHAR(255),
    'inventory_type' VARCHAR(25) NOT NULL DEFAULT 'nos',
    'size' VARCHAR(25),
    'weight' DECIMAL(10,3),
    'is_active' BOOLEAN NOT NULL DEFAULT TRUE,
    'category_id' INT,

    foreign key (category_id) references categories(id)
)

CREATE TABLE `product_barcodes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT,
    `barcode` VARCHAR(255) NOT NULL,

    foreign key (product_id) references products(id)
);

CREATE TABLE `product_stocks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `branch_id` VARCHAR(255),
    `product_id` INT,
    `quantity` INT NOT NULL DEFAULT 0,
    `sale_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `cost_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    foreign key (product_id) references products(id),
);


COMMIT;


CREATE TABLE `vendors` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255),
    `phone` VARCHAR(255),
    `address` TEXT,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE `customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255),
    `phone` VARCHAR(30) NOT NULL UNIQUE, 
    `address` TEXT,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE
);

-- GRN (Goods Received Note)
CREATE TABLE `grn` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `branch_id` VARCHAR(255),
    `vendor_id` INT,

    `grn_no` VARCHAR(255) NOT NULL,
    `grn_date` DATE NOT NULL,

    `invoice_no` VARCHAR(255),
    `invoice_date` DATE,
    `invoice_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `adjustment` DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    `notes` TEXT,

    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,

    foreign key (vendor_id) references vendors(id)
);

CREATE TABLE `grn_products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `grn_id` INT NOT NULL,
    `product_id` INT,
    `quantity` INT NOT NULL DEFAULT 0,
    `cost_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `sale_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    foreign key (grn_id) references grn(id),
    foreign key (product_id) references products(id)
);



-- Sales order
CREATE TABLE `sales_orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `branch_id` VARCHAR(255),
    `customer_id` INT,
    `order_no` VARCHAR(255) NOT NULL,
    `order_date` DATE NOT NULL,
    `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `adjustment` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `payment_method` VARCHAR(25),
    `notes` TEXT,

    foreign key (customer_id) references customers(id)
);

CREATE TABLE `sales_order_products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sales_order_id` INT NOT NULL,
    `product_id` INT,
    `quantity` INT NOT NULL DEFAULT 0,
    `sale_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    foreign key (sales_order_id) references sales_orders(id),
    foreign key (product_id) references products(id)
);


-- Good Transfer Note

CREATE TABLE `gtn` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `from_branch_id` VARCHAR(255),
    `to_branch_id` VARCHAR(255),
    `gtn_no` VARCHAR(255) NOT NULL,
    `gtn_date` DATE NOT NULL,
    `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `notes` TEXT,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE `gtn_products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `gtn_id` INT NOT NULL,
    `product_id` INT,
    `quantity` INT NOT NULL DEFAULT 0,
    `cost_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `sale_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    foreign key (gtn_id) references gtn(id),
    foreign key (product_id) references products(id)
);
COMMIT;


/**
Sales Return
 */
CREATE TABLE `sales_returns` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `branch_id` VARCHAR(255),
    `customer_id` INT,
    `return_no` VARCHAR(255) NOT NULL,
    `return_date` DATE NOT NULL,
    `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `adjustment` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `payment_method` VARCHAR(25),
    `notes` TEXT,

    foreign key (customer_id) references customers(id)
);

CREATE TABLE `sales_return_products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sales_return_id` INT NOT NULL,
    `product_id` INT,
    `quantity` INT NOT NULL DEFAULT 0,
    `sale_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    foreign key (sales_return_id) references sales_returns(id),
    foreign key (product_id) references products(id)
);

COMMIT;


-- Purchase Return
CREATE TABLE `purchase_returns` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `branch_id` VARCHAR(255),
    `vendor_id` INT,
    `return_no` VARCHAR(255) NOT NULL,
    `return_date` DATE NOT NULL,
    `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `adjustment` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `payment_method` VARCHAR(25),
    `notes` TEXT,

    foreign key (vendor_id) references vendors(id)
);

CREATE TABLE `purchase_return_products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `purchase_return_id` INT NOT NULL,
    `product_id` INT,
    `quantity` INT NOT NULL DEFAULT 0,
    `cost_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `sale_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    foreign key (purchase_return_id) references purchase_returns(id),
    foreign key (product_id) references products(id)
);

-- end of file

/* Delete test data
DROP DATABASE db_test_company;
DROP USER 'user_test_company'@'%';
 */