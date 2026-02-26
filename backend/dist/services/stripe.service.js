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
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia',
});
async function createPaymentIntent(amount, metadata = {}) {
    return stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata,
    });
}
async function createCheckoutSession(params) {
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
    const refundParams = {
        payment_intent: paymentIntentId,
    };
    if (amount) {
        refundParams.amount = Math.round(amount * 100);
    }
    return stripe.refunds.create(refundParams);
}
async function getPaymentDetails(paymentIntentId) {
    return stripe.paymentIntents.retrieve(paymentIntentId);
}
function constructWebhookEvent(body, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
