/**
 * Company Package Manager
 * 
 *     - Add subscription to a company
 *     - Generate Invoices
 *     - Auto-renew subscriptions when payment is made
 *     - Send notifications to companies when subscription is about to expire
 */

import { register_api_endpoint, register_event, register_user_permissions } from "../../modules/app_manager";
import config from "./config";
import { api_add_subscription_to_company } from "./endpoints/admin/addCompanyPackage";
import { cron_generate_invoices } from "./endpoints/admin/generateInvoices";
import get_company_subscription_details from "./endpoints/admin/getSubscriptionDetails";
import get_company_invoices from "./endpoints/getCompanyInvoices";
import get_payment_checkout_form from "./endpoints/payments/CheckoutApi/getCheckoutForm";
import checkout_invoice_via_stripe from "./endpoints/payments/StripeCheckout/CheckoutViaStripe";
import stripe_payment_event_webhook from "./endpoints/payments/StripeCheckout/StripePayentEvent";

/** Init the module */
export function init_module(){
    // Register available permissions
    config.permissions.forEach((permission) => {
        register_user_permissions(permission.name, permission.description, config.name);
    });

    // Register Event Handlers
    event_listners();

    // Register API Endpoints
    endpoints();
}


function endpoints() {
    /*
    register_api_endpoint({
        route: '/hello-world',
        is_protected: false,
        handler: api_endpoint_hello_world
    });
    */
    const route_prefix = "/subscription-manager";

    register_api_endpoint({
        route: `${route_prefix}/add-subscription`,
        is_protected: true,
        method: "POST",
        handler: api_add_subscription_to_company
    });

    register_api_endpoint({
        route: `${route_prefix}/get-subscription`,
        is_protected: true,
        method: "GET",
        handler: get_company_subscription_details
    });


    register_api_endpoint({
        route: `${route_prefix}/get-invoices`,
        is_protected: true,
        method: "GET",
        handler: get_company_invoices
    });



    /**
     * Cron Jobs
     */
    register_api_endpoint({
        route: `${route_prefix}/cron/generate-invoices`,
        is_protected: false,
        method: "GET",
        handler: cron_generate_invoices
    });


    /**
     * Payment API + Webhooks
     */
    register_api_endpoint({
        route: `${route_prefix}/checkout/get-form-data`,
        is_protected: true,
        method: "GET",
        handler: get_payment_checkout_form
    });

    register_api_endpoint({
        route: `${route_prefix}/checkout/create-stripe-session`,
        is_protected: true,
        method: "GET",
        handler: checkout_invoice_via_stripe
    });

    register_api_endpoint({
        route: `${route_prefix}/checkout/stripe-event-webhook`,
        is_protected: false,
        method: "POST",
        is_express_router: true,
        unparsed: true,
        handler: stripe_payment_event_webhook
    });
}
function event_listners(){
    /*register_event({
        event_name:"sys_company_manager/after_creating_company",
        handler: create_company_database_on_creating_company
    });*/
}

