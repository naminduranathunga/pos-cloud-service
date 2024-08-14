// https://support.payhere.lk/api-&-mobile-sdk/checkout-api

export interface PayhereCheckoutFormInterface {
    action: string;
    merchant_id: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    order_id: string;
    items: string;
    currency: string;
    amount: string;
    hash: string;
}