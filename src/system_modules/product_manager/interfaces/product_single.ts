import ProductCategory from "./product_category";

export interface ProductBarcode {
    id?: number;
    barcode: string;
    product_id: number;
}

export default interface ProductSingle{
    id?: number;
    name: string;
    sku: string;
    inventory_type: string;
    category?: number | ProductCategory;
    is_active: boolean;
    thumbnail?: string;
    size: string;
    weight: string;

    barcodes?: Array<string>;
    prices?: Array<number>;
}

export interface ProductInventoryInterface {
    id: number,
    branch_id?: string,
    product_id: number,
    sales_price: number,
    cost_price: number,
    quantity: number,
}