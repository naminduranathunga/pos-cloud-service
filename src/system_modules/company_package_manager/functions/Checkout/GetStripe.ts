import Stripe from "stripe";

export default function getStripe() {
    const stripe = new Stripe(process.env.STRIPE_API_KEY);
    return stripe;
}