import { raw, Request, Response, Router } from "express";
import getStripe from "../../../functions/Checkout/GetStripe";
import StripeHandleSessionComplete from "../../../functions/Checkout/StripeHandleSessionComplete";
import bodyParser from "body-parser";


/**
 * A webhook event from Stripe to notify the server of a payment event
 */
const stripe_payment_event_webhook = Router();
stripe_payment_event_webhook.post('/', bodyParser.raw({inflate: true, limit: '10mb', type: 'application/json'}), async (req: Request, res: Response) => {
    // record the request body to the console

    const sig = req.headers['stripe-signature'];
    const stripe = getStripe();
    
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(err);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    
    switch (event.type) {
        case 'checkout.session.completed':
            console.log("Checkout session completed", event.data.object.id);
            StripeHandleSessionComplete(event.data.object.id);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).json({
        message: "Payment initiated successfully"
    });
});

export default stripe_payment_event_webhook;