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