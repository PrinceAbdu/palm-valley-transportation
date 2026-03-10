import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import Booking from '../models/Booking';
import { User } from '../models/User';
import Driver from '../models/Driver';
import Vehicle from '../models/Vehicle';
import PopularPlace from '../models/PopularPlace';
import PricingRule from '../models/PricingRule';
import PromoCode from '../models/PromoCode';
import Notification from '../models/Notification';
import { BOOKING_STATUS } from '../constants';
import { notifyStatusUpdate, notifyDriverAssigned } from '../services/notification.service';
import { sendEmail } from '../services/email.service';

export const adminRoutes = Router();

async function createBookingStatusNotification(booking: any, status: string): Promise<void> {
    const riderId = booking?.riderId?._id || booking?.riderId;
    if (!riderId) return;

    const link = `/dashboard/my-rides/${booking._id}?fromNotification=1`;

    if (status === BOOKING_STATUS.CONFIRMED) {
        await Notification.create({
            userId: riderId,
            type: 'ride',
            title: 'Booking Confirmed',
            message: `Your booking ${booking.bookingNumber} has been confirmed. Thank you for choosing Palm Valley Transportation!`,
            link,
            bookingId: booking._id,
        });
        return;
    }

    if (status === BOOKING_STATUS.CANCELLED_BY_ADMIN || status === BOOKING_STATUS.DECLINED) {
        await Notification.create({
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
adminRoutes.use('/admin', requireAuth, requireRole('admin'));

// GET /api/admin/analytics
adminRoutes.get('/admin/analytics', async (_req: Request, res: Response) => {
    try {
        const [totalUsers, totalDrivers, totalBookings, totalVehicles, bookings] = await Promise.all([
            User.countDocuments(),
            Driver.countDocuments(),
            Booking.countDocuments(),
            Vehicle.countDocuments(),
            Booking.find().lean(),
        ]);

        const totalRevenue = bookings
            .filter((b) => b.paymentStatus === 'paid' || b.status === BOOKING_STATUS.COMPLETED)
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyRevenue = bookings
            .filter((b) => new Date(b.createdAt) >= firstOfMonth && (b.paymentStatus === 'paid' || b.status === BOOKING_STATUS.COMPLETED))
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        const statusBreakdown: Record<string, number> = {};
        for (const b of bookings) {
            statusBreakdown[b.status] = (statusBreakdown[b.status] || 0) + 1;
        }

        const recentBookings = await Booking.find()
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
    } catch (error: any) {
        console.error('Analytics error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
});

// GET /api/admin/bookings
adminRoutes.get('/admin/bookings', async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const filter: any = {};
        if (status && status !== 'all') filter.status = status;

        const bookings = await Booking.find(filter)
            .populate('riderId', 'firstName lastName email phone')
            .populate({ path: 'vehicleId', select: 'name type', strictPopulate: false })
            .populate('driverId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ success: true, data: bookings });
    } catch (error) {
        console.error('Admin bookings error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
});

// PUT /api/admin/bookings/:id
adminRoutes.put('/admin/bookings/:id', async (req: Request, res: Response) => {
    try {
        const { action, status, driverId, vehicleId, notes, quotedPrice, stripePaymentUrl, paymentStatus } = req.body;

        const booking = await Booking.findById(req.params.id)
            .populate('riderId', 'firstName lastName email phone notificationPreferences');

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        // Handle quote
        if (action === 'quote' && quotedPrice !== undefined) {
            booking.quotedPrice = quotedPrice;
            booking.quoteStatus = 'quoted';
            booking.quotedAt = new Date();
            if (stripePaymentUrl) booking.stripePaymentUrl = stripePaymentUrl;
            await booking.save();
            return res.json({ success: true, data: booking, message: 'Quote sent successfully' });
        }

        if (status) booking.status = status;
        if (paymentStatus) booking.paymentStatus = paymentStatus;
        if (driverId) booking.driverId = driverId;
        if (vehicleId) booking.vehicleId = vehicleId;
        if (notes) booking.specialRequests = notes;

        if (status === BOOKING_STATUS.COMPLETED) {
            booking.completedAt = new Date();
            if (!paymentStatus) booking.paymentStatus = 'paid';
        }
        if (status && status.includes('cancelled')) booking.cancelledAt = new Date();

        await booking.save();

        if (status) {
            await createBookingStatusNotification(booking, status);
        }

        const rider: any = booking.riderId;
        if (status && rider?.notificationPreferences) {
            await notifyStatusUpdate(booking, status, rider.notificationPreferences);
        }

        if (driverId) {
            const driver = await Driver.findById(driverId);
            if (driver && rider?.notificationPreferences) {
                await notifyDriverAssigned(booking, `${driver.firstName} ${driver.lastName}`, rider.notificationPreferences);
            }
        }

        return res.json({ success: true, data: booking, message: 'Booking updated successfully' });
    } catch (error: any) {
        console.error('Admin update booking error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to update booking' });
    }
});

// POST /api/admin/bookings/:id/broadcast
adminRoutes.post('/admin/bookings/:id/broadcast', async (req: Request, res: Response) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const { createRideRequest } = await import('../services/ride-assignment.service');
        const result = await createRideRequest(booking._id.toString());

        if (result.success) {
            booking.status = BOOKING_STATUS.CONFIRMED;
            await booking.save();
        }

        return res.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Broadcast ride error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to broadcast ride' });
    }
});

// POST /api/admin/bookings/:id/decline
adminRoutes.post('/admin/bookings/:id/decline', async (req: Request, res: Response) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('riderId', 'firstName lastName email phone notificationPreferences');
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const { reason } = req.body;
        booking.status = BOOKING_STATUS.DECLINED;
        booking.cancelledAt = new Date();
        if (reason) booking.specialRequests = `${booking.specialRequests || ''}\nDeclined reason: ${reason}`.trim();
        await booking.save();

        const rider: any = booking.riderId;
        if (rider?.notificationPreferences) {
            await notifyStatusUpdate(booking, 'declined', rider.notificationPreferences);
        }

        await createBookingStatusNotification(booking, BOOKING_STATUS.DECLINED);

        return res.json({ success: true, data: booking, message: 'Booking declined' });
    } catch (error: any) {
        console.error('Decline booking error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to decline booking' });
    }
});

// POST /api/admin/bookings/quote
adminRoutes.post('/admin/bookings/quote', async (req: Request, res: Response) => {
    try {
        const { bookingId, quotedPrice, stripePaymentUrl, notes } = req.body;

        if (!bookingId || quotedPrice === undefined) {
            return res.status(400).json({ success: false, error: 'Booking ID and quoted price are required' });
        }

        const booking = await Booking.findById(bookingId).populate('riderId', 'email firstName lastName');
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        booking.quotedPrice = quotedPrice;
        booking.quoteStatus = 'quoted';
        booking.quotedAt = new Date();
        if (stripePaymentUrl) booking.stripePaymentUrl = stripePaymentUrl;
        if (notes) booking.specialRequests = `${booking.specialRequests || ''}\nAdmin notes: ${notes}`.trim();
        await booking.save();

        const rider = booking.riderId as any;
        const recipientEmail = booking.guestEmail || rider?.email || '';
        const emailAddressFound = Boolean(recipientEmail);
        let emailSent = false;

        if (emailAddressFound) {
            const paymentLinkHtml = stripePaymentUrl
                ? `<p><strong>Payment link:</strong> <a href="${stripePaymentUrl}">${stripePaymentUrl}</a></p>`
                : '';
            const notesHtml = notes ? `<p><strong>Notes:</strong> ${notes}</p>` : '';

            emailSent = await sendEmail({
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
    } catch (error: any) {
        console.error('Quote error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to send quote' });
    }
});

// --- Admin Users ---
adminRoutes.get('/admin/users', async (req: Request, res: Response) => {
    try {
        const { role, search } = req.query;
        const filter: any = {};
        if (role && role !== 'all') filter.role = role;
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: users });
    } catch (error) {
        console.error('Admin users error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

adminRoutes.put('/admin/users/:id', async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const { role, isActive, firstName, lastName, phone, email } = req.body;
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (email) user.email = email;

        await user.save();
        const updated: any = user.toObject();
        delete updated.password;

        return res.json({ success: true, data: updated, message: 'User updated successfully' });
    } catch (error) {
        console.error('Admin update user error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update user' });
    }
});

adminRoutes.delete('/admin/users/:id', async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.isActive = false;
        await user.save();

        return res.json({ success: true, message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        return res.status(500).json({ success: false, error: 'Failed to deactivate user' });
    }
});

// --- Admin Drivers ---
adminRoutes.get('/admin/drivers', async (_req: Request, res: Response) => {
    try {
        const drivers = await Driver.find().sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: drivers });
    } catch (error) {
        console.error('Admin drivers error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch drivers' });
    }
});

adminRoutes.post('/admin/drivers', async (req: Request, res: Response) => {
    try {
        const driver = await Driver.create(req.body);
        return res.status(201).json({ success: true, data: driver });
    } catch (error: any) {
        console.error('Create driver error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create driver' });
    }
});

adminRoutes.put('/admin/drivers/:id', async (req: Request, res: Response) => {
    try {
        const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });
        return res.json({ success: true, data: driver, message: 'Driver updated' });
    } catch (error) {
        console.error('Update driver error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update driver' });
    }
});

adminRoutes.delete('/admin/drivers/:id', async (req: Request, res: Response) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });
        return res.json({ success: true, message: 'Driver deleted' });
    } catch (error) {
        console.error('Delete driver error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete driver' });
    }
});

// --- Admin Vehicles ---
adminRoutes.get('/admin/vehicles', async (_req: Request, res: Response) => {
    try {
        const vehicles = await Vehicle.find().sort({ order: 1, createdAt: -1 }).lean();
        return res.json({ success: true, data: vehicles });
    } catch (error) {
        console.error('Admin vehicles error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch vehicles' });
    }
});

adminRoutes.post('/admin/vehicles', async (req: Request, res: Response) => {
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

        const existingVehicle = await Vehicle.findOne({
            registrationNumber: { $regex: `^${payload.registrationNumber}$`, $options: 'i' },
        }).lean();
        if (existingVehicle) {
            return res.status(409).json({ success: false, error: 'A vehicle with this registration number already exists' });
        }

        const vehicle = await Vehicle.create(payload);
        return res.status(201).json({ success: true, data: vehicle });
    } catch (error: any) {
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

adminRoutes.put('/admin/vehicles/:id', async (req: Request, res: Response) => {
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
            const existingVehicle = await Vehicle.findOne({
                _id: { $ne: req.params.id },
                registrationNumber: { $regex: `^${payload.registrationNumber}$`, $options: 'i' },
            }).lean();
            if (existingVehicle) {
                return res.status(409).json({ success: false, error: 'A vehicle with this registration number already exists' });
            }
        }

        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });
        return res.json({ success: true, data: vehicle, message: 'Vehicle updated' });
    } catch (error: any) {
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

adminRoutes.delete('/admin/vehicles/:id', async (req: Request, res: Response) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });
        return res.json({ success: true, message: 'Vehicle deleted' });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete vehicle' });
    }
});

// --- Admin Popular Places ---
adminRoutes.get('/admin/popular-places', async (_req: Request, res: Response) => {
    try {
        const places = await PopularPlace.find().sort({ order: 1 }).lean();
        return res.json({ success: true, data: places });
    } catch (error) {
        console.error('Admin popular places error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch popular places' });
    }
});

adminRoutes.post('/admin/popular-places', async (req: Request, res: Response) => {
    try {
        const place = await PopularPlace.create(req.body);
        return res.status(201).json({ success: true, data: place });
    } catch (error: any) {
        console.error('Create popular place error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create popular place' });
    }
});

adminRoutes.put('/admin/popular-places/:id', async (req: Request, res: Response) => {
    try {
        const place = await PopularPlace.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!place) return res.status(404).json({ success: false, error: 'Place not found' });
        return res.json({ success: true, data: place, message: 'Popular place updated' });
    } catch (error) {
        console.error('Update popular place error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update popular place' });
    }
});

adminRoutes.delete('/admin/popular-places/:id', async (req: Request, res: Response) => {
    try {
        const place = await PopularPlace.findByIdAndDelete(req.params.id);
        if (!place) return res.status(404).json({ success: false, error: 'Place not found' });
        return res.json({ success: true, message: 'Popular place deleted' });
    } catch (error) {
        console.error('Delete popular place error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete popular place' });
    }
});

// --- Admin Pricing ---
adminRoutes.get('/admin/pricing', async (_req: Request, res: Response) => {
    try {
        const pricing = await PricingRule.findOne({ isActive: true }).lean();
        return res.json({ success: true, data: pricing });
    } catch (error) {
        console.error('Admin pricing error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch pricing' });
    }
});

adminRoutes.put('/admin/pricing', async (req: Request, res: Response) => {
    try {
        let pricing = await PricingRule.findOne({ isActive: true });
        if (pricing) {
            Object.assign(pricing, req.body);
            await pricing.save();
        } else {
            pricing = await PricingRule.create(req.body);
        }
        return res.json({ success: true, data: pricing, message: 'Pricing updated' });
    } catch (error) {
        console.error('Update pricing error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update pricing' });
    }
});

// --- Admin Promo Codes ---
adminRoutes.get('/admin/promo-codes', async (_req: Request, res: Response) => {
    try {
        const codes = await PromoCode.find().sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: codes });
    } catch (error) {
        console.error('Admin promo codes error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch promo codes' });
    }
});

adminRoutes.post('/admin/promo-codes', async (req: Request, res: Response) => {
    try {
        const code = await PromoCode.create({ ...req.body, createdBy: req.user?.userId });
        return res.status(201).json({ success: true, data: code });
    } catch (error: any) {
        console.error('Create promo code error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create promo code' });
    }
});

adminRoutes.put('/admin/promo-codes/:id', async (req: Request, res: Response) => {
    try {
        const code = await PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!code) return res.status(404).json({ success: false, error: 'Promo code not found' });
        return res.json({ success: true, data: code, message: 'Promo code updated' });
    } catch (error) {
        console.error('Update promo code error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update promo code' });
    }
});

adminRoutes.delete('/admin/promo-codes/:id', async (req: Request, res: Response) => {
    try {
        const code = await PromoCode.findByIdAndDelete(req.params.id);
        if (!code) return res.status(404).json({ success: false, error: 'Promo code not found' });
        return res.json({ success: true, message: 'Promo code deleted' });
    } catch (error) {
        console.error('Delete promo code error:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete promo code' });
    }
});

// --- Admin Settings ---
adminRoutes.get('/admin/settings', async (_req: Request, res: Response) => {
    try {
        const pricing = await PricingRule.findOne({ isActive: true }).lean();
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
    } catch (error) {
        console.error('Admin settings error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
});

adminRoutes.put('/admin/settings', async (req: Request, res: Response) => {
    try {
        const { pricing } = req.body;
        if (pricing) {
            let pricingRule = await PricingRule.findOne({ isActive: true });
            if (pricingRule) {
                Object.assign(pricingRule, pricing);
                await pricingRule.save();
            } else {
                await PricingRule.create(pricing);
            }
        }
        return res.json({ success: true, message: 'Settings updated' });
    } catch (error) {
        console.error('Update settings error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
});

// --- Admin Reports ---
adminRoutes.get('/admin/reports', async (req: Request, res: Response) => {
    try {
        const period = parseInt(req.query.period as string) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        const totalBookings = await Booking.countDocuments({ createdAt: { $gte: startDate } });
        const completedBookings = await Booking.countDocuments({ status: 'completed', createdAt: { $gte: startDate } });
        const cancelledBookings = await Booking.countDocuments({
            status: { $in: ['cancelled', 'cancelled_by_admin', 'cancelled_by_driver', 'declined'] },
            createdAt: { $gte: startDate },
        });
        const noShows = await Booking.countDocuments({ status: 'no_show', createdAt: { $gte: startDate } });

        const revenueResult = await Booking.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: startDate } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, avgOrderValue: { $avg: '$totalPrice' } } },
        ]);
        const revenue = revenueResult[0] || { totalRevenue: 0, avgOrderValue: 0 };

        const bookingsByStatus = await Booking.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const bookingsByTripType = await Booking.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$tripType', count: { $sum: 1 } } },
        ]);

        const dailyBookings = await Booking.aggregate([
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
    } catch (error: any) {
        console.error('Reports error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to generate reports' });
    }
});

// --- Admin Driver Assign ---
adminRoutes.post('/admin/drivers/:id/assign', async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.body;
        const driverId = req.params.id;

        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, error: 'Driver not found' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        booking.driverId = driver._id;
        booking.status = 'driver_assigned';
        await booking.save();

        return res.json({ success: true, data: booking, message: 'Booking assigned to driver successfully' });
    } catch (error: any) {
        console.error('Assign booking error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to assign booking' });
    }
});

// --- Admin Seed Routes ---
// POST /api/admin/seed/users
adminRoutes.post('/admin/seed/users', async (_req: Request, res: Response) => {
    try {
        const testUsers = [
            { email: 'admin@palmvalley.com', password: 'admin123', firstName: 'Admin', lastName: 'User', phone: '904-555-0001', role: 'admin', isActive: true, isEmailVerified: true },
            { email: 'driver@palmvalley.com', password: 'driver123', firstName: 'John', lastName: 'Driver', phone: '904-555-0002', role: 'driver', isActive: true, isEmailVerified: true },
            { email: 'rider@palmvalley.com', password: 'rider123', firstName: 'Jane', lastName: 'Rider', phone: '904-555-0003', role: 'rider', isActive: true, isEmailVerified: true },
        ];

        const createdUsers: any[] = [];

        for (const userData of testUsers) {
            let user = await User.findOne({ email: userData.email });
            if (user) {
                createdUsers.push({ email: userData.email, status: 'already exists', role: user.role });
            } else {
                user = await User.create(userData);
                createdUsers.push({ email: user.email, status: 'created', role: user.role });
            }

            if (userData.role === 'driver' && user) {
                const existingDriver = await Driver.findOne({ userId: user._id });
                if (!existingDriver) {
                    await Driver.create({
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
    } catch (error: any) {
        console.error('Seed users error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to seed users' });
    }
});

// POST /api/admin/seed/vehicles
adminRoutes.post('/admin/seed/vehicles', async (_req: Request, res: Response) => {
    try {
        const vehicles = [
            { name: 'Luxury Sedan', type: 'sedan', description: 'Perfect for business travel and airport transfers', maxPassengers: 4, maxLuggage: 3, features: ['Leather Seats', 'Climate Control', 'Premium Sound', 'WiFi', 'Phone Chargers'], basePrice: 50, priceMultiplier: 1.0, image: '', isActive: true },
            { name: 'Premium SUV', type: 'suv', description: 'Ideal for families and small groups', maxPassengers: 6, maxLuggage: 5, features: ['Spacious Interior', 'Third Row Seating', 'Entertainment System', 'WiFi', 'Climate Control'], basePrice: 75, priceMultiplier: 1.5, image: '', isActive: true },
            { name: 'Executive Van', type: 'van', description: 'Great for group travel and events', maxPassengers: 10, maxLuggage: 8, features: ['Captain Chairs', 'Entertainment', 'Ample Storage', 'WiFi', 'USB Ports'], basePrice: 100, priceMultiplier: 2.0, image: '', isActive: true },
            { name: 'Luxury Sprinter', type: 'luxury', description: 'Ultimate comfort for special occasions', maxPassengers: 12, maxLuggage: 10, features: ['Leather Recliners', 'Premium Bar', 'LED Ambient Lighting', 'WiFi', 'Entertainment'], basePrice: 150, priceMultiplier: 2.5, image: '', isActive: true },
        ];

        await Vehicle.deleteMany({});
        const created = await Vehicle.insertMany(vehicles);

        return res.json({ success: true, message: `Created ${created.length} vehicles`, data: created });
    } catch (error: any) {
        console.error('Seed vehicles error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to seed vehicles' });
    }
});

