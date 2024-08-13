

export interface CustomerUsageInvoice {
    _id?: string;
    company_id: string;
    taxAmount?: number;
    totalAmount: number; // including tax
    paidAmount: number;
    dueAmount: number;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate: Date;
    isPaid: boolean;
    paymentDate?: Date;
    paymentMethod?: string;
    paymentReference?: string;
    paymentNotes?: string;
    invoiceItems: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;

    /**
     * Used for auto-reccuring payments (if enabled)
     */
    autoReccuringPayment: boolean;
    autoReccuringPaymentMethod?: string;
    autoReccuringPaymentAttempts: number;
}
