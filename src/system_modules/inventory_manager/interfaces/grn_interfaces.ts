

export interface GRNInterface {
    id?: number;
    branch_id: string;
    branch_name?: string;
    vendor_id?: number;
    vendor_name?: string;

    grn_number: string;
    grn_date: string;
    invoice_number?: string;
    invoice_date?: string;
    invoice_amount: number;
    total_amount: number;
    adjustment: number;
    notes: string;

    products: {
        product_id: number;
        quantity: number;
        cost_price: number;
        sale_price: number;
    }[];
};