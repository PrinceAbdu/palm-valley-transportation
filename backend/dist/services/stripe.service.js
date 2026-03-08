"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = createPaymentIntent;
exports.createCheckoutSession = createCheckoutSession;
exports.processRefund = processRefund;
exports.getPaymentDetails = getPaymentDetails;
exports.constructWebhookEvent = constructWebhookEvent;
const stripe_1 = __importDefault(require("stripe"));
let stripeClient = null;
function getStripeClient() {
    if (stripeClient) {
        return stripeClient;
    }
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env');
    }
    stripeClient = new stripe_1.default(secretKey, {
        apiVersion: '2024-12-18.acacia',
    });
    return stripeClient;
}
async function createPaymentIntent(amount, metadata = {}) {
    const stripe = getStripeClient();
    return stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata,
    });
}
async function createCheckoutSession(params) {
    const stripe = getStripeClient();
    return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Palm Valley Transportation - Ride Booking`,
                    },
                    unit_amount: Math.round(params.amount * 100),
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.customerEmail,
        metadata: {
            bookingId: params.bookingId,
        },
    });
}
async function processRefund(paymentIntentId, amount) {
    const stripe = getStripeClient();
    const refundParams = {
        payment_intent: paymentIntentId,
    };
    if (amount) {
        refundParams.amount = Math.round(amount * 100);
    }
    return stripe.refunds.create(refundParams);
}
async function getPaymentDetails(paymentIntentId) {
    const stripe = getStripeClient();
    return stripe.paymentIntents.retrieve(paymentIntentId);
}
function constructWebhookEvent(body, signature) {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error('Stripe webhook is not configured. Set STRIPE_WEBHOOK_SECRET in backend/.env');
    }
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
