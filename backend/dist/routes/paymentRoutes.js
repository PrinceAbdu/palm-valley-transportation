"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Booking_1 = __importDefault(require("../models/Booking"));
const stripe_service_1 = require("../services/stripe.service");
const constants_1 = require("../constants");
const notification_service_1 = require("../services/notification.service");
exports.paymentRoutes = (0, express_1.Router)();
// POST /api/payments/create-intent
exports.paymentRoutes.post('/payments/create-intent', auth_1.requireAuth, async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId) {
            return res.status(400).json({ success: false, error: 'Booking ID is required' });
        }
        const booking = await Booking_1.default.findById(bookingId).populate('riderId', 'email');
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        const rider = booking.riderId;
        if (rider?._id?.toString() !== req.user?.userId) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        const paymentIntent = await (0, stripe_service_1.createPaymentIntent)(booking.totalPrice ?? 0, { bookingId: booking._id.toString() });
        booking.paymentIntentId = paymentIntent.id;
        await booking.save();
        return res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            },
        });
    }
    catch (error) {
        console.error('Create payment intent error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create payment intent' });
    }
});
// POST /api/payments/create-checkout-session
exports.paymentRoutes.post('/payments/create-checkout-session', auth_1.requireAuth, async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId) {
            return res.status(400).json({ success: false, error: 'Booking ID is required' });
        }
        const booking = await Booking_1.default.findById(bookingId).populate('riderId', 'email');
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        const rider = booking.riderId;
        if (rider?._id?.toString() !== req.user?.userId) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        const baseUrl = process.env.APP_URL || 'http://localhost:3000';
        const session = await (0, stripe_service_1.createCheckoutSession)({
            amount: booking.totalPrice ?? 0,
            bookingId: booking._id.toString(),
            successUrl: `${baseUrl}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking._id}`,
            cancelUrl: `${baseUrl}/booking/checkout?booking_id=${booking._id}`,
            customerEmail: rider?.email || '',
        });
        booking.stripeSessionId = session.id;
        await booking.save();
        return res.json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url,
            },
        });
    }
    catch (error) {
        console.error('Create checkout session error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create checkout session' });
    }
});
// POST /api/payments/refund
exports.paymentRoutes.post('/payments/refund', auth_1.requireAuth, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const { bookingId, amount } = req.body;
        if (!bookingId) {
            return res.status(400).json({ success: false, error: 'Booking ID is required' });
        }
        const booking = await Booking_1.default.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        if (!booking.paymentIntentId) {
            return res.status(400).json({ success: false, error: 'No payment to refund' });
        }
        const refund = await (0, stripe_service_1.processRefund)(booking.paymentIntentId, amount);
        booking.paymentStatus = 'refunded';
        booking.refundAmount = refund.amount / 100;
        booking.refundId = refund.id;
        await booking.save();
        return res.json({
            success: true,
            data: {
                refundId: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
            },
            message: 'Refund processed successfully',
        });
    }
    catch (error) {
        console.error('Refund error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to process refund' });
    }
});
// POST /api/payments/webhook - Stripe webhook
exports.paymentRoutes.post('/payments/webhook', async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        if (!signature) {
            return res.status(400).json({ error: 'No signature provided' });
        }
        // req.body will be raw buffer when using express.raw middleware
        const body = typeof req.body === 'string' ? req.body : req.body.toString();
        const event = (0, stripe_service_1.constructWebhookEvent)(body, signature);
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const bookingId = paymentIntent.metadata.bookingId;
                if (bookingId) {
                    const booking = await Booking_1.default.findById(bookingId)
                        .populate('riderId', 'email firstName lastName notificationPreferences');
                    if (booking) {
                        booking.status = constants_1.BOOKING_STATUS.CONFIRMED;
                        booking.paymentStatus = 'paid';
                        booking.paymentIntentId = paymentIntent.id;
                        await booking.save();
                        await (0, notification_service_1.notifyBookingCreated)(booking, booking.riderId?.notificationPreferences);
                        console.log(`Payment succeeded for booking ${booking.bookingNumber}`);
                    }
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                const failedPayment = event.data.object;
                const failedBookingId = failedPayment.metadata.bookingId;
                if (failedBookingId) {
                    const booking = await Booking_1.default.findById(failedBookingId);
                    if (booking) {
                        booking.paymentStatus = 'failed';
                        await booking.save();
                        console.log(`Payment failed for booking ${booking.bookingNumber}`);
                    }
                }
                break;
            }
            case 'checkout.session.completed': {
                const session = event.data.object;
                const sessionBookingId = session.metadata?.bookingId;
                if (sessionBookingId) {
                    const booking = await Booking_1.default.findById(sessionBookingId)
                        .populate('riderId', 'email firstName lastName notificationPreferences');
                    if (booking) {
                        booking.status = constants_1.BOOKING_STATUS.CONFIRMED;
                        booking.paymentStatus = 'paid';
                        booking.stripeSessionId = session.id;
                        await booking.save();
                        await (0, notification_service_1.notifyBookingCreated)(booking, booking.riderId?.notificationPreferences);
                        console.log(`Checkout completed for booking ${booking.bookingNumber}`);
                    }
                }
                break;
            }
            case 'charge.refunded': {
                const refund = event.data.object;
                console.log(`Refund processed: ${refund.id}`);
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        return res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        return res.status(400).json({ error: error.message || 'Webhook handler failed' });
    }
});
// POST /api/webhooks/stripe - Alias for the webhook
exports.paymentRoutes.post('/webhooks/stripe', async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        if (!signature) {
            return res.status(400).json({ error: 'No signature provided' });
        }
        const body = typeof req.body === 'string' ? req.body : req.body.toString();
        const event = (0, stripe_service_1.constructWebhookEvent)(body, signature);
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const sessionBookingId = session.metadata?.bookingId;
                if (sessionBookingId) {
                    const booking = await Booking_1.default.findById(sessionBookingId)
                        .populate('riderId', 'email firstName lastName notificationPreferences');
                    if (booking) {
                        booking.status = constants_1.BOOKING_STATUS.CONFIRMED;
                        booking.paymentStatus = 'paid';
                        booking.stripeSessionId = session.id;
                        await booking.save();
                        await (0, notification_service_1.notifyBookingCreated)(booking, booking.riderId?.notificationPreferences);
                    }
                }
                break;
            }
            default:
                console.log(`Unhandled webhook event: ${event.type}`);
        }
        return res.json({ received: true });
    }
    catch (error) {
        console.error('Stripe webhook error:', error);
        return res.status(400).json({ error: error.message || 'Webhook handler failed' });
    }
});
