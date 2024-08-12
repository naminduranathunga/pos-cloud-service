import mongoose, { Schema } from "mongoose";


const CustomerInvoiceSchema = new Schema({
    company_id: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        required: true
    },
    dueAmount: {
        type: Number,
        required: true
    },

    invoiceNumber: {
        type: String,
        required: true
    },
    invoiceDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    isPaid: {
        type: Boolean,
        required: true
    },
    paymentDate: {
        type: Date,
        required: false
    },
    paymentMethod: {
        type: String,
        required: false
    },
    paymentReference: {
        type: String,
        required: false
    },
    paymentNotes: {
        type: String,
        required: false
    },
    invoiceItems: {
        type: Array,
        required: true
    },
    autoReccuringPayment: {
        type: Boolean,
        required: true
    },
    autoReccuringPaymentMethod: {
        type: String,
        required: false
    },
    autoReccuringPaymentAttempts: {
        type: Number,
        required: true
    },
    customOptions: {
        type: Object,
        required: false
    }
});

const CustomerInvoice = mongoose.model('CustomerInvoice', CustomerInvoiceSchema);
export default CustomerInvoice;