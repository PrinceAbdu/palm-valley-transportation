"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Booking_1 = __importDefault(require("../models/Booking"));
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const constants_1 = require("../constants");
const pricing_service_1 = require("../services/pricing.service");
const receipt_service_1 = require("../services/receipt.service");
exports.bookingRoutes = (0, express_1.Router)();
// POST /api/bookings - Create booking
exports.bookingRoutes.post('/bookings', async (req, res) => {
    try {
        const body = req.body;
        const booking = await Booking_1.default.create({
            ...body,
            status: body.status || 'pending_payment',
        });
        return res.status(201).json({ success: true, data: booking });
    }
    catch (error) {
        console.error('Error creating booking:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create booking' });
    }
});
// GET /api/bookings - List bookings
exports.bookingRoutes.get('/bookings', async (req, res) => {
    try {
        const { status, riderId } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (riderId)
            filter.riderId = riderId;
        const bookings = await Booking_1.default.find(filter)
            .populate('riderId', 'firstName lastName email phone')
            .populate({ path: 'vehicleId', select: 'name type maxPassengers maxLuggage imageUrl', strictPopulate: false })
            .populate('driverId')
            .sort({ createdAt: -1 })
            .lean();
        return res.json({ success: true, data: bookings });
    }
    catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
});
// POST /api/bookings/estimate - Price estimate
exports.bookingRoutes.post('/bookings/estimate', async (req, res) => {
    try {
        const { tripType, pickupLat, pickupLng, dropoffLat, dropoffLng, hours, isAirportRide, meetAndGreet, vehicleId } = req.body;
        if (!Object.values(constants_1.TRIP_TYPES).includes(tripType)) {
            return res.status(400).json({ success: false, error: 'Invalid trip type' });
        }
        let vehicleMultiplier = 1;
        if (vehicleId) {
            const vehicle = await Vehicle_1.default.findById(vehicleId);
            if (vehicle)
                vehicleMultiplier = vehicle.priceMultiplier || 1;
        }
        let distance = 0;
        let duration = 0;
        if (tripType !== constants_1.TRIP_TYPES.HOURLY) {
            if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
                return res.status(400).json({ success: false, error: 'Pickup and dropoff coordinates required' });
            }
            distance = (0, pricing_service_1.calculateDistance)(parseFloat(pickupLat), parseFloat(pickupLng), parseFloat(dropoffLat), parseFloat(dropoffLng));
            duration = (0, pricing_service_1.estimateDuration)(distance);
        }
        const pricing = (0, pricing_service_1.calculatePrice)({
            tripType, distance, duration,
            hours: tripType === constants_1.TRIP_TYPES.HOURLY ? hours : undefined,
            isAirportRide, meetAndGreet, vehicleMultiplier,
        });
        return res.json({
            success: true,
            data: { tripType, distance, duration, hours: tripType === constants_1.TRIP_TYPES.HOURLY ? hours : undefined, ...pricing },
        });
    }
    catch (error) {
        console.error('Error calculating estimate:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to calculate estimate' });
    }
});
// GET /api/bookings/my-rides - Current user's bookings
exports.bookingRoutes.get('/bookings/my-rides', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const bookings = await Booking_1.default.find({ riderId: userId })
            .populate({ path: 'vehicleId', select: 'name type maxPassengers maxLuggage imageUrl', strictPopulate: false })
            .populate('driverId', 'userId')
            .sort({ createdAt: -1 })
            .lean();
        return res.json({ success: true, data: bookings });
    }
    catch (error) {
        console.error('Error fetching user bookings:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
});
// GET /api/bookings/:id - Booking details
exports.bookingRoutes.get('/bookings/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const booking = await Booking_1.default.findById(req.params.id)
            .populate({ path: 'vehicleId', select: 'name type maxPassengers maxLuggage imageUrl features', strictPopulate: false })
            .populate('driverId', 'userId')
            .populate('riderId', 'firstName lastName email phone')
            .lean();
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        const rider = booking.riderId;
        if (rider?._id?.toString() !== userId && req.user?.role !== 'admin' && req.user?.role !== 'driver') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        return res.json({ success: true, data: booking });
    }
    catch (error) {
        console.error('Error fetching booking:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch booking' });
    }
});
// PUT /api/bookings/:id - Cancel booking
exports.bookingRoutes.put('/bookings/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const booking = await Booking_1.default.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        const bookingRiderId = booking.riderId?.toString?.();
        if (!bookingRiderId || bookingRiderId !== userId) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        const cancellableStatuses = [
            constants_1.BOOKING_STATUS.PENDING_PAYMENT,
            constants_1.BOOKING_STATUS.PAID_PENDING_CONFIRMATION,
            constants_1.BOOKING_STATUS.CONFIRMED,
            constants_1.BOOKING_STATUS.DRIVER_ASSIGNED,
        ];
        if (!cancellableStatuses.includes(booking.status)) {
            return res.status(400).json({ success: false, error: 'This booking cannot be cancelled' });
        }
        const now = new Date();
        const scheduledDateTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
        const hoursUntilRide = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        const totalPrice = booking.totalPrice ?? 0;
        let refundAmount = 0;
        if (hoursUntilRide >= 24)
            refundAmount = totalPrice;
        else if (hoursUntilRide >= 2)
            refundAmount = totalPrice * 0.5;
        booking.status = constants_1.BOOKING_STATUS.CANCELLED_BY_RIDER;
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
    }
    catch (error) {
        console.error('Error cancelling booking:', error);
        return res.status(500).json({ success: false, error: 'Failed to cancel booking' });
    }
});
// GET /api/bookings/:id/receipt - Download receipt
exports.bookingRoutes.get('/bookings/:id/receipt', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const booking = await Booking_1.default.findById(req.params.id)
            .populate('riderId', 'firstName lastName email phone')
            .populate({ path: 'vehicleId', select: 'name', strictPopulate: false })
            .lean();
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        const rider = booking.riderId;
        if (req.user?.role !== 'admin' && rider?._id?.toString() !== userId) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        const vehicle = booking.vehicleId;
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
        const pdf = (0, receipt_service_1.generateReceipt)(receiptData);
        const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt-${booking.bookingNumber}.pdf"`);
        return res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error generating receipt:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to generate receipt' });
    }
});
