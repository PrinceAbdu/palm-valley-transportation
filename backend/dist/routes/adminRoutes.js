"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Booking_1 = __importDefault(require("../models/Booking"));
const User_1 = require("../models/User");
const Driver_1 = __importDefault(require("../models/Driver"));
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const PopularPlace_1 = __importDefault(require("../models/PopularPlace"));
const PricingRule_1 = __importDefault(require("../models/PricingRule"));
const PromoCode_1 = __importDefault(require("../models/PromoCode"));
const Notification_1 = __importDefault(require("../models/Notification"));
const constants_1 = require("../constants");
const notification_service_1 = require("../services/notification.service");
const email_service_1 = require("../services/email.service");
exports.adminRoutes = (0, express_1.Router)();
async function createBookingStatusNotification(booking, status) {
    const riderId = booking?.riderId?._id || booking?.riderId;
    if (!riderId)
        return;
    const link = `/dashboard/my-rides/${booking._id}?fromNotification=1`;
    if (status === constants_1.BOOKING_STATUS.CONFIRMED) {
        await Notification_1.default.create({
            userId: riderId,
            type: 'ride',
            title: 'Booking Confirmed',
            message: `Your booking ${booking.bookingNumber} has been confirmed. Thank you for choosing Palm Valley Transportation!`,
            link,
            bookingId: booking._id,
        });
        return;
    }
    if (status === constants_1.BOOKING_STATUS.CANCELLED_BY_ADMIN || status === constants_1.BOOKING_STATUS.DECLINED) {
        await Notification_1.default.create({
            userId: riderId,
            type: 'ride',
            title: 'Booking Cancelled',
            message: `Your booking ${booking.bookingNumber} has been cancelled. Please contact support if you need help with rebooking.`,
            link,
            bookingId: booking._id,
        });
    }
}
// All admin routes require auth + admin role
exports.adminRoutes.use('/admin', auth_1.requireAuth, (0, auth_1.requireRole)('admin'));
// GET /api/admin/analytics
exports.adminRoutes.get('/admin/analytics', async (_req, res) => {
    try {
        const [totalUsers, totalDrivers, totalBookings, totalVehicles, bookings] = await Promise.all([
            User_1.User.countDocuments(),
            Driver_1.default.countDocuments(),
            Booking_1.default.countDocuments(),
            Vehicle_1.default.countDocuments(),
            Booking_1.default.find().lean(),
        ]);
        const totalRevenue = bookings
            .filter((b) => b.paymentStatus === 'paid' || b.status === constants_1.BOOKING_STATUS.COMPLETED)
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyRevenue = bookings
            .filter((b) => new Date(b.createdAt) >= firstOfMonth && (b.paymentStatus === 'paid' || b.status === constants_1.BOOKING_STATUS.COMPLETED))
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const statusBreakdown = {};
        for (const b of bookings) {
            statusBreakdown[b.status] = (statusBreakdown[b.status] || 0) + 1;
        }
        const recentBookings = await Booking_1.default.find()
            .populate('riderId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        return res.json({
            success: true,
            data: {
                totalUsers, totalDrivers, totalBookings, totalVehicles,
                totalRevenue, monthlyRevenue, statusBreakdown, recentBookings,
            },
        });
    }
    catch (error) {
        console.error('Analytics error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
});
// GET /api/admin/bookings
exports.adminRoutes.get('/admin/bookings', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'all')
            filter.status = status;
        const bookings = await Booking_1.default.find(filter)
            .populate('riderId', 'firstName lastName email phone')
            .populate({ path: 'vehicleId', select: 'name type', strictPopulate: false })
            .populate('driverId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .lean();
        return res.json({ success: true, data: bookings });
    }
    catch (error) {
        console.error('Admin bookings error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
});
// PUT /api/admin/bookings/:id
exports.adminRoutes.put('/admin/bookings/:id', async (req, res) => {
    try {
        const { action, status, driverId, vehicleId, notes, quotedPrice, stripePaymentUrl, paymentStatus } = req.body;
        const booking = await Booking_1.default.findById(req.params.id)
            .populate('riderId', 'firstName lastName email phone notificationPreferences');
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        // Handle quote
        if (action === 'quote' && quotedPrice !== undefined) {
            booking.quotedPrice = quotedPrice;
            booking.quoteStatus = 'quoted';
            booking.quotedAt = new Date();
            if (stripePaymentUrl)
                booking.stripePaymentUrl = stripePaymentUrl;
            await booking.save();
            return res.json({ success: true, data: booking, message: 'Quote sent successfully' });
        }
        if (status)
            booking.status = status;
        if (paymentStatus)
            booking.paymentStatus = paymentStatus;
        if (driverId)
            booking.driverId = driverId;
        if (vehicleId)
            booking.vehicleId = vehicleId;
        if (notes)
            booking.specialRequests = notes;
        if (status === constants_1.BOOKING_STATUS.COMPLETED) {
            booking.completedAt = new Date();
            if (!paymentStatus)
                booking.paymentStatus = 'paid';
        }
        if (status && status.includes('cancelled'))
            booking.cancelledAt = new Date();
        await booking.save();
        if (status) {
            await createBookingStatusNotification(booking, status);
        }
        const rider = booking.riderId;
        if (status && rider?.notificationPreferences) {
            await (0, notification_service_1.notifyStatusUpdate)(booking, status, rider.notificationPreferences);
        }
        if (driverId) {
            const driver = await Driver_1.default.findById(driverId);
            if (driver && rider?.notificationPreferences) {
                await (0, notification_service_1.notifyDriverAssigned)(booking, `${driver.firstName} ${driver.lastName}`, rider.notificationPreferences);
            }
        }
        return res.json({ success: true, data: booking, message: 'Booking updated successfully' });
    }
    catch (error) {
        console.error('Admin update booking error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to update booking' });
    }
});
// POST /api/admin/bookings/:id/broadcast
exports.adminRoutes.post('/admin/bookings/:id/broadcast', async (req, res) => {
    try {
        const booking = await Booking_1.default.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        const { createRideRequest } = await Promise.resolve().then(() => __importStar(require('../services/ride-assignment.service')));
        const result = await createRideRequest(booking._id.toString());
        if (result.success) {
            booking.status = constants_1.BOOKING_STATUS.CONFIRMED;
            await booking.save();
        }
        return res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Broadcast ride error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to broadcast ride' });
    }
});
// POST /api/admin/bookings/:id/decline
exports.adminRoutes.post('/admin/bookings/:id/decline', async (req, res) => {
    try {
        const booking = await Booking_1.default.findById(req.params.id)
            .populate('riderId', 'firstName lastName email phone notificationPreferences');
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        const { reason } = req.body;
        booking.status = constants_1.BOOKING_STATUS.DECLINED;
        booking.cancelledAt = new Date();
        if (reason)
            booking.specialRequests = `${booking.specialRequests || ''}\nDeclined reason: ${reason}`.trim();
        await booking.save();
        const rider = booking.riderId;
        if (rider?.notificationPreferences) {
            await (0, notification_service_1.notifyStatusUpdate)(booking, 'declined', rider.notificationPreferences);
        }
        await createBookingStatusNotification(booking, constants_1.BOOKING_STATUS.DECLINED);
        return res.json({ success: true, data: booking, message: 'Booking declined' });
    }
    catch (error) {
        console.error('Decline booking error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to decline booking' });
    }
});
// POST /api/admin/bookings/quote
exports.adminRoutes.post('/admin/bookings/quote', async (req, res) => {
    try {
        const { bookingId, quotedPrice, stripePaymentUrl, notes } = req.body;
        if (!bookingId || quotedPrice === undefined) {
            return res.status(400).json({ success: false, error: 'Booking ID and quoted price are required' });
        }
        const booking = await Booking_1.default.findById(bookingId).populate('riderId', 'email firstName lastName');
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        booking.quotedPrice = quotedPrice;
        booking.quoteStatus = 'quoted';
        booking.quotedAt = new Date();
        if (stripePaymentUrl)
            booking.stripePaymentUrl = stripePaymentUrl;
        if (notes)
            booking.specialRequests = `${booking.specialRequests || ''}\nAdmin notes: ${notes}`.trim();
        await booking.save();
        const rider = booking.riderId;
        const recipientEmail = booking.guestEmail || rider?.email || '';
        const emailAddressFound = Boolean(recipientEmail);
        let emailSent = false;
        if (emailAddressFound) {
            const paymentLinkHtml = stripePaymentUrl
                ? `<p><strong>Payment link:</strong> <a href="${stripePaymentUrl}">${stripePaymentUrl}</a></p>`
                : '';
            const notesHtml = notes ? `<p><strong>Notes:</strong> ${notes}</p>` : '';
            emailSent = await (0, email_service_1.sendEmail)({
                to: recipientEmail,
                subject: `Quote for Booking ${booking.bookingNumber}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #1e40af;">Your Price Quote</h1>
                        <p>Booking <strong>${booking.bookingNumber}</strong> has been quoted.</p>
                        <p><strong>Quoted Price:</strong> $${Number(quotedPrice).toFixed(2)}</p>
                        ${paymentLinkHtml}
                        ${notesHtml}
                    </div>
                `,
            });
        }
        return res.json({
            success: true,
            data: {
                booking,
                emailSent,
                emailAddressFound,
                recipientEmail: recipientEmail || null,
            },
            message: 'Quote saved successfully',
        });
    }
    catch (error) {
        console.error('Quote error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to send quote' });
    }
});
// --- Admin Users ---
exports.adminRoutes.get('/admin/users', async (req, res) => {
    try {
        const { role, search } = req.query;
        const filter = {};
        if (role && role !== 'all')
            filter.role = role;
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const users = await User_1.User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: users });
    }
    catch (error) {
        console.error('Admin users error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});
exports.adminRoutes.put('/admin/users/:id', async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, error: 'User not found' });
        const { role, isActive, firstName, lastName, phone, email } = req.body;
        if (role)
            user.role = role;
        if (isActive !== undefined)
            user.isActive = isActive;
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (phone)
            user.phone = phone;
        if (email)
            user.email = email;
        await user.save();
        const updated = user.toObject();
        delete updated.password;
        return res.json({ success: true, data: updated, message: 'User updated successfully' });
    }
    catch (error) {
        console.error('Admin update user error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update user' });
    }
});
exports.adminRoutes.delete('/admin/users/:id', async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, error: 'User not found' });
        user.isActive = false;
        await user.save();
        return res.json({ success: true, message: 'User deactivated successfully' });
    }
    catch (error) {
        console.error('Admin delete user error:', error);
        return res.status(500).json({ success: false, error: 'Failed to deactivate user' });
    }
});
// --- Admin Drivers ---
exports.adminRoutes.get('/admin/drivers', async (_req, res) => {
    try {
        const drivers = await Driver_1.default.find().sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: drivers });
    }
    catch (error) {
        console.error('Admin drivers error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch drivers' });
    }
});
exports.adminRoutes.post('/admin/drivers', async (req, res) => {
    try {
        const driver = await Driver_1.default.create(req.body);
        return res.status(201).json({ success: true, data: driver });
    }
    catch (error) {
        console.error('Create driver error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create driver' });
    }
});
exports.adminRoutes.put('/admin/drivers/:id', async (req, res) => {
    try {
        const driver = await Driver_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!driver)
            return res.status(404).json({ success: false, error: 'Driver not found' });
        return res.json({ success: true, data: driver, message: 'Driver updated' });
    }
    catch (error) {
        console.error('Update driver error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update driver' });
    }
});
exports.adminRoutes.delete('/admin/drivers/:id', async (req, res) => {
    try {
        const driver = await Driver_1.default.findByIdAndDelete(req.params.id);
        if (!driver)
            return res.status(404).json({ success: false, error: 'Driver not found' });
        return res.json({ success: true, message: 'Driver deleted' });
    }
    catch (error) {
        console.error('Delete driver error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete driver' });
    }
});
// --- Admin Vehicles ---
exports.adminRoutes.get('/admin/vehicles', async (_req, res) => {
    try {
        const vehicles = await Vehicle_1.default.find().sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: vehicles });
    }
    catch (error) {
        console.error('Admin vehicles error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch vehicles' });
    }
});
exports.adminRoutes.post('/admin/vehicles', async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.registrationNumber) {
            payload.registrationNumber = String(payload.registrationNumber).trim().toUpperCase();
        }
        if (!payload.vin && payload.registrationNumber) {
            payload.vin = payload.registrationNumber;
        }
        if (payload.vin) {
            payload.vin = String(payload.vin).trim().toUpperCase();
        }
        if (payload.vin === '') {
            delete payload.vin;
        }
        if (!payload.licensePlate && payload.registrationNumber) {
            payload.licensePlate = payload.registrationNumber;
        }
        if (payload.licensePlate === '') {
            delete payload.licensePlate;
        }
        const existingVehicle = await Vehicle_1.default.findOne({
            registrationNumber: { $regex: `^${payload.registrationNumber}$`, $options: 'i' },
        }).lean();
        if (existingVehicle) {
            return res.status(409).json({ success: false, error: 'A vehicle with this registration number already exists' });
        }
        const vehicle = await Vehicle_1.default.create(payload);
        return res.status(201).json({ success: true, data: vehicle });
    }
    catch (error) {
        console.error('Create vehicle error:', error);
        if (error?.code === 11000 && error?.keyPattern?.registrationNumber) {
            return res.status(409).json({ success: false, error: 'A vehicle with this registration number already exists' });
        }
        if (error?.code === 11000 && error?.keyPattern?.vin) {
            return res.status(409).json({ success: false, error: 'A vehicle with this VIN already exists' });
        }
        return res.status(500).json({ success: false, error: error.message || 'Failed to create vehicle' });
    }
});
exports.adminRoutes.put('/admin/vehicles/:id', async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.registrationNumber) {
            payload.registrationNumber = String(payload.registrationNumber).trim().toUpperCase();
        }
        if (!payload.vin && payload.registrationNumber) {
            payload.vin = payload.registrationNumber;
        }
        if (payload.vin) {
            payload.vin = String(payload.vin).trim().toUpperCase();
        }
        if (payload.vin === '') {
            delete payload.vin;
        }
        if (!payload.licensePlate && payload.registrationNumber) {
            payload.licensePlate = payload.registrationNumber;
        }
        if (payload.licensePlate === '') {
            delete payload.licensePlate;
        }
        if (payload.registrationNumber) {
            const existingVehicle = await Vehicle_1.default.findOne({
                _id: { $ne: req.params.id },
                registrationNumber: { $regex: `^${payload.registrationNumber}$`, $options: 'i' },
            }).lean();
            if (existingVehicle) {
                return res.status(409).json({ success: false, error: 'A vehicle with this registration number already exists' });
            }
        }
        const vehicle = await Vehicle_1.default.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!vehicle)
            return res.status(404).json({ success: false, error: 'Vehicle not found' });
        return res.json({ success: true, data: vehicle, message: 'Vehicle updated' });
    }
    catch (error) {
        console.error('Update vehicle error:', error);
        if (error?.code === 11000 && error?.keyPattern?.registrationNumber) {
            return res.status(409).json({ success: false, error: 'A vehicle with this registration number already exists' });
        }
        if (error?.code === 11000 && error?.keyPattern?.vin) {
            return res.status(409).json({ success: false, error: 'A vehicle with this VIN already exists' });
        }
        return res.status(500).json({ success: false, error: 'Failed to update vehicle' });
    }
});
exports.adminRoutes.delete('/admin/vehicles/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle_1.default.findByIdAndDelete(req.params.id);
        if (!vehicle)
            return res.status(404).json({ success: false, error: 'Vehicle not found' });
        return res.json({ success: true, message: 'Vehicle deleted' });
    }
    catch (error) {
        console.error('Delete vehicle error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete vehicle' });
    }
});
// --- Admin Popular Places ---
exports.adminRoutes.get('/admin/popular-places', async (_req, res) => {
    try {
        const places = await PopularPlace_1.default.find().sort({ order: 1 }).lean();
        return res.json({ success: true, data: places });
    }
    catch (error) {
        console.error('Admin popular places error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch popular places' });
    }
});
exports.adminRoutes.post('/admin/popular-places', async (req, res) => {
    try {
        const place = await PopularPlace_1.default.create(req.body);
        return res.status(201).json({ success: true, data: place });
    }
    catch (error) {
        console.error('Create popular place error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create popular place' });
    }
});
exports.adminRoutes.put('/admin/popular-places/:id', async (req, res) => {
    try {
        const place = await PopularPlace_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!place)
            return res.status(404).json({ success: false, error: 'Place not found' });
        return res.json({ success: true, data: place, message: 'Popular place updated' });
    }
    catch (error) {
        console.error('Update popular place error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update popular place' });
    }
});
exports.adminRoutes.delete('/admin/popular-places/:id', async (req, res) => {
    try {
        const place = await PopularPlace_1.default.findByIdAndDelete(req.params.id);
        if (!place)
            return res.status(404).json({ success: false, error: 'Place not found' });
        return res.json({ success: true, message: 'Popular place deleted' });
    }
    catch (error) {
        console.error('Delete popular place error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete popular place' });
    }
});
// --- Admin Pricing ---
exports.adminRoutes.get('/admin/pricing', async (_req, res) => {
    try {
        const pricing = await PricingRule_1.default.findOne({ isActive: true }).lean();
        return res.json({ success: true, data: pricing });
    }
    catch (error) {
        console.error('Admin pricing error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch pricing' });
    }
});
exports.adminRoutes.put('/admin/pricing', async (req, res) => {
    try {
        let pricing = await PricingRule_1.default.findOne({ isActive: true });
        if (pricing) {
            Object.assign(pricing, req.body);
            await pricing.save();
        }
        else {
            pricing = await PricingRule_1.default.create(req.body);
        }
        return res.json({ success: true, data: pricing, message: 'Pricing updated' });
    }
    catch (error) {
        console.error('Update pricing error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update pricing' });
    }
});
// --- Admin Promo Codes ---
exports.adminRoutes.get('/admin/promo-codes', async (_req, res) => {
    try {
        const codes = await PromoCode_1.default.find().sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: codes });
    }
    catch (error) {
        console.error('Admin promo codes error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch promo codes' });
    }
});
exports.adminRoutes.post('/admin/promo-codes', async (req, res) => {
    try {
        const code = await PromoCode_1.default.create({ ...req.body, createdBy: req.user?.userId });
        return res.status(201).json({ success: true, data: code });
    }
    catch (error) {
        console.error('Create promo code error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create promo code' });
    }
});
exports.adminRoutes.put('/admin/promo-codes/:id', async (req, res) => {
    try {
        const code = await PromoCode_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!code)
            return res.status(404).json({ success: false, error: 'Promo code not found' });
        return res.json({ success: true, data: code, message: 'Promo code updated' });
    }
    catch (error) {
        console.error('Update promo code error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update promo code' });
    }
});
exports.adminRoutes.delete('/admin/promo-codes/:id', async (req, res) => {
    try {
        const code = await PromoCode_1.default.findByIdAndDelete(req.params.id);
        if (!code)
            return res.status(404).json({ success: false, error: 'Promo code not found' });
        return res.json({ success: true, message: 'Promo code deleted' });
    }
    catch (error) {
        console.error('Delete promo code error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete promo code' });
    }
});
// --- Admin Settings ---
exports.adminRoutes.get('/admin/settings', async (_req, res) => {
    try {
        const pricing = await PricingRule_1.default.findOne({ isActive: true }).lean();
        return res.json({
            success: true,
            data: {
                pricing: pricing || {},
                serviceArea: {
                    center: { lat: 30.3322, lng: -81.6557 },
                    radiusMiles: 100,
                },
            },
        });
    }
    catch (error) {
        console.error('Admin settings error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
});
exports.adminRoutes.put('/admin/settings', async (req, res) => {
    try {
        const { pricing } = req.body;
        if (pricing) {
            let pricingRule = await PricingRule_1.default.findOne({ isActive: true });
            if (pricingRule) {
                Object.assign(pricingRule, pricing);
                await pricingRule.save();
            }
            else {
                await PricingRule_1.default.create(pricing);
            }
        }
        return res.json({ success: true, message: 'Settings updated' });
    }
    catch (error) {
        console.error('Update settings error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
});
// --- Admin Reports ---
exports.adminRoutes.get('/admin/reports', async (req, res) => {
    try {
        const period = parseInt(req.query.period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        const totalBookings = await Booking_1.default.countDocuments({ createdAt: { $gte: startDate } });
        const completedBookings = await Booking_1.default.countDocuments({ status: 'completed', createdAt: { $gte: startDate } });
        const cancelledBookings = await Booking_1.default.countDocuments({
            status: { $in: ['cancelled', 'cancelled_by_admin', 'cancelled_by_driver', 'declined'] },
            createdAt: { $gte: startDate },
        });
        const noShows = await Booking_1.default.countDocuments({ status: 'no_show', createdAt: { $gte: startDate } });
        const revenueResult = await Booking_1.default.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: startDate } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, avgOrderValue: { $avg: '$totalPrice' } } },
        ]);
        const revenue = revenueResult[0] || { totalRevenue: 0, avgOrderValue: 0 };
        const bookingsByStatus = await Booking_1.default.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const bookingsByTripType = await Booking_1.default.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$tripType', count: { $sum: 1 } } },
        ]);
        const dailyBookings = await Booking_1.default.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$totalPrice', 0] } },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        const completionRate = totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : '0';
        const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : '0';
        const noShowRate = totalBookings > 0 ? ((noShows / totalBookings) * 100).toFixed(1) : '0';
        return res.json({
            success: true,
            data: {
                summary: {
                    totalBookings, completedBookings, cancelledBookings, noShows,
                    totalRevenue: revenue.totalRevenue, avgOrderValue: revenue.avgOrderValue,
                    completionRate: parseFloat(completionRate), cancellationRate: parseFloat(cancellationRate), noShowRate: parseFloat(noShowRate),
                },
                breakdowns: { byStatus: bookingsByStatus, byTripType: bookingsByTripType },
                trends: { daily: dailyBookings },
                period: { days: period, startDate: startDate.toISOString(), endDate: new Date().toISOString() },
            },
        });
    }
    catch (error) {
        console.error('Reports error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to generate reports' });
    }
});
// --- Admin Driver Assign ---
exports.adminRoutes.post('/admin/drivers/:id/assign', async (req, res) => {
    try {
        const { bookingId } = req.body;
        const driverId = req.params.id;
        const driver = await Driver_1.default.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, error: 'Driver not found' });
        }
        const booking = await Booking_1.default.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        booking.driverId = driver._id;
        booking.status = 'driver_assigned';
        await booking.save();
        return res.json({ success: true, data: booking, message: 'Booking assigned to driver successfully' });
    }
    catch (error) {
        console.error('Assign booking error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to assign booking' });
    }
});
// --- Admin Seed Routes ---
// POST /api/admin/seed/users
exports.adminRoutes.post('/admin/seed/users', async (_req, res) => {
    try {
        const testUsers = [
            { email: 'admin@palmvalley.com', password: 'admin123', firstName: 'Admin', lastName: 'User', phone: '904-555-0001', role: 'admin', isActive: true, isEmailVerified: true },
            { email: 'driver@palmvalley.com', password: 'driver123', firstName: 'John', lastName: 'Driver', phone: '904-555-0002', role: 'driver', isActive: true, isEmailVerified: true },
            { email: 'rider@palmvalley.com', password: 'rider123', firstName: 'Jane', lastName: 'Rider', phone: '904-555-0003', role: 'rider', isActive: true, isEmailVerified: true },
        ];
        const createdUsers = [];
        for (const userData of testUsers) {
            let user = await User_1.User.findOne({ email: userData.email });
            if (user) {
                createdUsers.push({ email: userData.email, status: 'already exists', role: user.role });
            }
            else {
                user = await User_1.User.create(userData);
                createdUsers.push({ email: user.email, status: 'created', role: user.role });
            }
            if (userData.role === 'driver' && user) {
                const existingDriver = await Driver_1.default.findOne({ userId: user._id });
                if (!existingDriver) {
                    await Driver_1.default.create({
                        userId: user._id,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        email: userData.email,
                        phone: userData.phone,
                        licenseNumber: `FL-DRV-${user._id.toString().slice(-6).toUpperCase()}`,
                        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        isAvailable: true,
                        status: 'active',
                    });
                }
            }
        }
        return res.json({
            success: true,
            message: 'Test users seeded successfully',
            data: {
                users: createdUsers,
                credentials: [
                    { role: 'Admin', email: 'admin@palmvalley.com', password: 'admin123' },
                    { role: 'Driver', email: 'driver@palmvalley.com', password: 'driver123' },
                    { role: 'Rider', email: 'rider@palmvalley.com', password: 'rider123' },
                ],
            },
        });
    }
    catch (error) {
        console.error('Seed users error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to seed users' });
    }
});
// POST /api/admin/seed/vehicles
exports.adminRoutes.post('/admin/seed/vehicles', async (_req, res) => {
    try {
        const vehicles = [
            { name: 'Luxury Sedan', type: 'sedan', description: 'Perfect for business travel and airport transfers', maxPassengers: 4, maxLuggage: 3, features: ['Leather Seats', 'Climate Control', 'Premium Sound', 'WiFi', 'Phone Chargers'], basePrice: 50, priceMultiplier: 1.0, image: '', isActive: true },
            { name: 'Premium SUV', type: 'suv', description: 'Ideal for families and small groups', maxPassengers: 6, maxLuggage: 5, features: ['Spacious Interior', 'Third Row Seating', 'Entertainment System', 'WiFi', 'Climate Control'], basePrice: 75, priceMultiplier: 1.5, image: '', isActive: true },
            { name: 'Executive Van', type: 'van', description: 'Great for group travel and events', maxPassengers: 10, maxLuggage: 8, features: ['Captain Chairs', 'Entertainment', 'Ample Storage', 'WiFi', 'USB Ports'], basePrice: 100, priceMultiplier: 2.0, image: '', isActive: true },
            { name: 'Luxury Sprinter', type: 'luxury', description: 'Ultimate comfort for special occasions', maxPassengers: 12, maxLuggage: 10, features: ['Leather Recliners', 'Premium Bar', 'LED Ambient Lighting', 'WiFi', 'Entertainment'], basePrice: 150, priceMultiplier: 2.5, image: '', isActive: true },
        ];
        await Vehicle_1.default.deleteMany({});
        const created = await Vehicle_1.default.insertMany(vehicles);
        return res.json({ success: true, message: `Created ${created.length} vehicles`, data: created });
    }
    catch (error) {
        console.error('Seed vehicles error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to seed vehicles' });
    }
});
