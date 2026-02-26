import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import Booking from '../models/Booking';
import { createPaymentIntent, createCheckoutSession, processRefund, constructWebhookEvent } from '../services/stripe.service';
import { BOOKING_STATUS } from '../constants';
import { notifyBookingCreated } from '../services/notification.service';

export const paymentRoutes = Router();

// POST /api/payments/create-intent
paymentRoutes.post('/payments/create-intent', requireAuth, async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({ success: false, error: 'Booking ID is required' });
        }

        const booking = await Booking.findById(bookingId).populate('riderId', 'email');
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const rider = booking.riderId as any;
        if (rider?._id?.toString() !== req.user?.userId) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const paymentIntent = await createPaymentIntent(
            booking.totalPrice ?? 0,
            { bookingId: booking._id.toString() }
        );

        booking.paymentIntentId = paymentIntent.id;
        await booking.save();

        return res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            },
        });
    } catch (error: any) {
        console.error('Create payment intent error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create payment intent' });
    }
});

// POST /api/payments/create-checkout-session
paymentRoutes.post('/payments/create-checkout-session', requireAuth, async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({ success: false, error: 'Booking ID is required' });
        }

        const booking = await Booking.findById(bookingId).populate('riderId', 'email');
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const rider = booking.riderId as any;
        if (rider?._id?.toString() !== req.user?.userId) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const baseUrl = process.env.APP_URL || 'http://localhost:3000';

        const session = await createCheckoutSession({
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
    } catch (error: any) {
        console.error('Create checkout session error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create checkout session' });
    }
});

// POST /api/payments/refund
paymentRoutes.post('/payments/refund', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
    try {
        const { bookingId, amount } = req.body;

        if (!bookingId) {
            return res.status(400).json({ success: false, error: 'Booking ID is required' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        if (!booking.paymentIntentId) {
            return res.status(400).json({ success: false, error: 'No payment to refund' });
        }

        const refund = await processRefund(booking.paymentIntentId, amount);

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
    } catch (error: any) {
        console.error('Refund error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to process refund' });
    }
});

// POST /api/payments/webhook - Stripe webhook
paymentRoutes.post('/payments/webhook', async (req: Request, res: Response) => {
    try {
        const signature = req.headers['stripe-signature'] as string;

        if (!signature) {
            return res.status(400).json({ error: 'No signature provided' });
        }

        // req.body will be raw buffer when using express.raw middleware
        const body = typeof req.body === 'string' ? req.body : req.body.toString();
        const event = constructWebhookEvent(body, signature);

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as any;
                const bookingId = paymentIntent.metadata.bookingId;

                if (bookingId) {
                    const booking = await Booking.findById(bookingId)
                        .populate('riderId', 'email firstName lastName notificationPreferences');

                    if (booking) {
                        booking.status = BOOKING_STATUS.CONFIRMED;
                        booking.paymentStatus = 'paid';
                        booking.paymentIntentId = paymentIntent.id;
                        await booking.save();

                        await notifyBookingCreated(booking, (booking.riderId as any)?.notificationPreferences);
                        console.log(`Payment succeeded for booking ${booking.bookingNumber}`);
                    }
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const failedPayment = event.data.object as any;
                const failedBookingId = failedPayment.metadata.bookingId;

                if (failedBookingId) {
                    const booking = await Booking.findById(failedBookingId);
                    if (booking) {
                        booking.paymentStatus = 'failed';
                        await booking.save();
                        console.log(`Payment failed for booking ${booking.bookingNumber}`);
                    }
                }
                break;
            }

            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const sessionBookingId = session.metadata?.bookingId;

                if (sessionBookingId) {
                    const booking = await Booking.findById(sessionBookingId)
                        .populate('riderId', 'email firstName lastName notificationPreferences');

                    if (booking) {
                        booking.status = BOOKING_STATUS.CONFIRMED;
                        booking.paymentStatus = 'paid';
                        booking.stripeSessionId = session.id;
                        await booking.save();

                        await notifyBookingCreated(booking, (booking.riderId as any)?.notificationPreferences);
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
    } catch (error: any) {
        console.error('Webhook error:', error);
        return res.status(400).json({ error: error.message || 'Webhook handler failed' });
    }
});

// POST /api/webhooks/stripe - Alias for the webhook
paymentRoutes.post('/webhooks/stripe', async (req: Request, res: Response) => {
    try {
        const signature = req.headers['stripe-signature'] as string;

        if (!signature) {
            return res.status(400).json({ error: 'No signature provided' });
        }

        const body = typeof req.body === 'string' ? req.body : req.body.toString();
        const event = constructWebhookEvent(body, signature);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const sessionBookingId = session.metadata?.bookingId;

                if (sessionBookingId) {
                    const booking = await Booking.findById(sessionBookingId)
                        .populate('riderId', 'email firstName lastName notificationPreferences');

                    if (booking) {
                        booking.status = BOOKING_STATUS.CONFIRMED;
                        booking.paymentStatus = 'paid';
                        booking.stripeSessionId = session.id;
                        await booking.save();

                        await notifyBookingCreated(booking, (booking.riderId as any)?.notificationPreferences);
                    }
                }
                break;
            }
            default:
                console.log(`Unhandled webhook event: ${event.type}`);
        }

        return res.json({ received: true });
    } catch (error: any) {
        console.error('Stripe webhook error:', error);
        return res.status(400).json({ error: error.message || 'Webhook handler failed' });
    }
});
