interface SalesNoteItem {
    id?: number;
    sales_note_id?: string;
    product_id: string;
    product_name?: string;
    quantity: number;
    sale_price: number;
    discount: number;
}
interface SalesNote {
    id?: number;
    sales_note_no: string;
    branch_id: string;
    branch_name?: string;
    customer_id?: number;
    sales_person_id?: string;
    sales_order_id?: number;
    sale_date: string | Date;
    total_amount: number;
    discount: number;
    adjustment: number;
    tax: number;
    delivery_fee: number;
    payment_method?: string;
    payment_status?: string;
    custom_fields?: any;
    notes?: string;
    status: "draft" | "confirmed" | "completed" | "returned" | "canceled";
    created_at?: string | Date;
    items: SalesNoteItem[];

    customer_name?: string;
}