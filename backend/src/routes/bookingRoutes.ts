import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import Booking from '../models/Booking';
import Vehicle from '../models/Vehicle';
import { BOOKING_STATUS, TRIP_TYPES } from '../constants';
import { calculatePrice, calculateDistance, estimateDuration } from '../services/pricing.service';
import { validateServiceArea } from '../services/service-area.service';
import { generateReceipt } from '../services/receipt.service';
import { sendAdminBookingRequestNotification } from '../services/email.service';

export const bookingRoutes = Router();

// POST /api/bookings - Create booking
bookingRoutes.post('/bookings', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const booking = await Booking.create({
            ...body,
            status: body.status || 'pending_payment',
        });

        // Send admin alert without blocking booking creation response.
        void sendAdminBookingRequestNotification(booking).catch((error) => {
            console.error('Failed to send admin booking request email:', error);
        });

        return res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
        console.error('Error creating booking:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create booking' });
    }
});

// GET /api/bookings - List bookings
bookingRoutes.get('/bookings', async (req: Request, res: Response) => {
    try {
        const { status, riderId } = req.query;
        const filter: any = {};
        if (status) filter.status = status;
        if (riderId) filter.riderId = riderId;

        const bookings = await Booking.find(filter)
            .populate('riderId', 'firstName lastName email phone')
            .populate({ path: 'vehicleId', select: 'name type maxPassengers maxLuggage imageUrl', strictPopulate: false })
            .populate('driverId')
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ success: true, data: bookings });
    } catch (error: any) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
});

// POST /api/bookings/estimate - Price estimate
bookingRoutes.post('/bookings/estimate', async (req: Request, res: Response) => {
    try {
        const { tripType, pickupLat, pickupLng, dropoffLat, dropoffLng, hours, isAirportRide, meetAndGreet, vehicleId } = req.body;

        if (!Object.values(TRIP_TYPES).includes(tripType)) {
            return res.status(400).json({ success: false, error: 'Invalid trip type' });
        }

        let vehicleMultiplier = 1;
        if (vehicleId) {
            const vehicle = await Vehicle.findById(vehicleId);
            if (vehicle) vehicleMultiplier = vehicle.priceMultiplier || 1;
        }

        let distance = 0;
        let duration = 0;

        if (tripType !== TRIP_TYPES.HOURLY) {
            if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
                return res.status(400).json({ success: false, error: 'Pickup and dropoff coordinates required' });
            }
            distance = calculateDistance(parseFloat(pickupLat), parseFloat(pickupLng), parseFloat(dropoffLat), parseFloat(dropoffLng));
            duration = estimateDuration(distance);
        }

        const pricing = calculatePrice({
            tripType, distance, duration,
            hours: tripType === TRIP_TYPES.HOURLY ? hours : undefined,
            isAirportRide, meetAndGreet, vehicleMultiplier,
        });

        return res.json({
            success: true,
            data: { tripType, distance, duration, hours: tripType === TRIP_TYPES.HOURLY ? hours : undefined, ...pricing },
        });
    } catch (error: any) {
        console.error('Error calculating estimate:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to calculate estimate' });
    }
});

// GET /api/bookings/my-rides - Current user's bookings
bookingRoutes.get('/bookings/my-rides', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const bookings = await Booking.find({ riderId: userId })
            .populate({ path: 'vehicleId', select: 'name type maxPassengers maxLuggage imageUrl', strictPopulate: false })
            .populate('driverId', 'userId')
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ success: true, data: bookings });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
});

// GET /api/bookings/:id - Booking details
bookingRoutes.get('/bookings/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const booking = await Booking.findById(req.params.id)
            .populate({ path: 'vehicleId', select: 'name type maxPassengers maxLuggage imageUrl features', strictPopulate: false })
            .populate('driverId', 'userId')
            .populate('riderId', 'firstName lastName email phone')
            .lean();

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const rider = booking.riderId as any;
        if (rider?._id?.toString() !== userId && req.user?.role !== 'admin' && req.user?.role !== 'driver') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        return res.json({ success: true, data: booking });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch booking' });
    }
});

// PUT /api/bookings/:id - Cancel booking
bookingRoutes.put('/bookings/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const bookingRiderId = booking.riderId?.toString?.();
        if (!bookingRiderId || bookingRiderId !== userId) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const cancellableStatuses = [
            BOOKING_STATUS.PENDING_PAYMENT,
            BOOKING_STATUS.PAID_PENDING_CONFIRMATION,
            BOOKING_STATUS.CONFIRMED,
            BOOKING_STATUS.DRIVER_ASSIGNED,
        ];

        if (!cancellableStatuses.includes(booking.status as any)) {
            return res.status(400).json({ success: false, error: 'This booking cannot be cancelled' });
        }

        const now = new Date();
        const scheduledDateTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
        const hoursUntilRide = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        const totalPrice = booking.totalPrice ?? 0;

        let refundAmount = 0;
        if (hoursUntilRide >= 24) refundAmount = totalPrice;
        else if (hoursUntilRide >= 2) refundAmount = totalPrice * 0.5;

        booking.status = BOOKING_STATUS.CANCELLED_BY_RIDER;
        booking.cancelledAt = new Date();
        await booking.save();

        return res.json({
            success: true,
            data: {
                booking,
                refundAmount,
                message: refundAmount > 0
                    ? `Booking cancelled. Refund of $${refundAmount.toFixed(2)} will be processed.`
                    : 'Booking cancelled. No refund due to cancellation policy.',
            },
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return res.status(500).json({ success: false, error: 'Failed to cancel booking' });
    }
});

// GET /api/bookings/:id/receipt - Download receipt
bookingRoutes.get('/bookings/:id/receipt', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const booking = await Booking.findById(req.params.id)
            .populate('riderId', 'firstName lastName email phone')
            .populate({ path: 'vehicleId', select: 'name', strictPopulate: false })
            .lean();

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const rider: any = booking.riderId;
        if (req.user?.role !== 'admin' && rider?._id?.toString() !== userId) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const vehicle = booking.vehicleId as any;
        const receiptData = {
            bookingNumber: booking.bookingNumber,
            bookingDate: new Date(booking.createdAt).toLocaleDateString(),
            tripDate: `${new Date(booking.scheduledDate).toLocaleDateString()} at ${booking.scheduledTime}`,
            riderName: `${rider?.firstName ?? ''} ${rider?.lastName ?? ''}`.trim(),
            riderEmail: rider?.email || '',
            riderPhone: rider?.phone || '',
            pickupAddress: booking.pickup?.address || '',
            dropoffAddress: booking.dropoff?.address,
            vehicleName: vehicle?.name || '',
            tripType: booking.tripType || 'one_way',
            passengers: booking.passengers,
            luggage: booking.luggage,
            basePrice: booking.basePrice || 0,
            fees: {
                airportFee: booking.fees?.airportFee ?? 0,
                meetGreetFee: booking.fees?.meetGreetFee ?? 0,
            },
            totalPrice: booking.totalPrice ?? 0,
            paymentMethod: 'Credit Card',
            status: booking.status,
        };

        const pdf = generateReceipt(receiptData);
        const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt-${booking.bookingNumber}.pdf"`);
        return res.send(pdfBuffer);
    } catch (error: any) {
        console.error('Error generating receipt:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to generate receipt' });
    }
});
