import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripeClient() {
    if (stripeClient) {
        return stripeClient;
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env');
    }

    stripeClient = new Stripe(secretKey, {
        apiVersion: '2024-12-18.acacia' as any,
    });

    return stripeClient;
}

export async function createPaymentIntent(amount: number, metadata: Record<string, string> = {}) {
    const stripe = getStripeClient();
    return stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata,
    });
}

export async function createCheckoutSession(params: {
    amount: number;
    bookingId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
}) {
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

export async function processRefund(paymentIntentId: string, amount?: number) {
    const stripe = getStripeClient();
    const refundParams: any = {
        payment_intent: paymentIntentId,
    };
    if (amount) {
        refundParams.amount = Math.round(amount * 100);
    }
    return stripe.refunds.create(refundParams);
}

export async function getPaymentDetails(paymentIntentId: string) {
    const stripe = getStripeClient();
    return stripe.paymentIntents.retrieve(paymentIntentId);
}

export function constructWebhookEvent(body: string, signature: string) {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error('Stripe webhook is not configured. Set STRIPE_WEBHOOK_SECRET in backend/.env');
    }
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
