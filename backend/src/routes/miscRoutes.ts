import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { User } from '../models/User';
import Vehicle from '../models/Vehicle';
import PopularPlace from '../models/PopularPlace';
import PromoCode from '../models/PromoCode';
import Driver from '../models/Driver';
import { processReminders } from '../services/reminder.service';
import { sendEmail } from '../services/email.service';
import { sendSMS } from '../services/sms.service';

export const miscRoutes = Router();

// --- User Profile ---
// GET /api/users/profile
miscRoutes.get('/users/profile', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const user = await User.findById(userId).select('-password').lean();
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        return res.json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
});

// PUT /api/users/profile
miscRoutes.put('/users/profile', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { firstName, lastName, phone } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;

        await user.save();

        const updatedUser: any = user.toObject();
        delete updatedUser.password;

        return res.json({
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully',
        });
    } catch (error: any) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to update profile' });
    }
});

// PUT /api/users/notification-preferences
miscRoutes.put('/users/notification-preferences', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { email, sms, push } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (email !== undefined) user.notificationPreferences.email = email;
        if (sms !== undefined) user.notificationPreferences.sms = sms;
        if (push !== undefined) user.notificationPreferences.push = push;

        await user.save();

        return res.json({
            success: true,
            data: user.notificationPreferences,
            message: 'Notification preferences updated successfully',
        });
    } catch (error: any) {
        console.error('Error updating notification preferences:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to update preferences' });
    }
});

// GET /api/users/notification-settings
miscRoutes.get('/users/notification-settings', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const user = await User.findById(userId).select('notificationPreferences').lean();
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        return res.json({ success: true, data: user.notificationPreferences });
    } catch (error) {
        console.error('Error fetching notification settings:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch notification settings' });
    }
});

// --- Vehicles ---
// GET /api/vehicles
miscRoutes.get('/vehicles', async (_req: Request, res: Response) => {
    try {
        const vehicles = await Vehicle.find({ isActive: true }).lean();
        return res.json({ success: true, data: vehicles });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch vehicles' });
    }
});

// POST /api/vehicles
miscRoutes.post('/vehicles', async (req: Request, res: Response) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        return res.status(201).json({ success: true, data: vehicle });
    } catch (error: any) {
        console.error('Error creating vehicle:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create vehicle' });
    }
});

// --- Popular Places ---
// GET /api/popular-places
miscRoutes.get('/popular-places', async (_req: Request, res: Response) => {
    try {
        const places = await PopularPlace.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .lean();
        return res.json({ success: true, data: places });
    } catch (error) {
        console.error('Error fetching popular places:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch popular places' });
    }
});

// POST /api/popular-places
miscRoutes.post('/popular-places', async (req: Request, res: Response) => {
    try {
        const place = await PopularPlace.create(req.body);
        return res.status(201).json({ success: true, data: place });
    } catch (error: any) {
        console.error('Error creating popular place:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create popular place' });
    }
});

// PUT /api/popular-places/:id
miscRoutes.put('/popular-places/:id', async (req: Request, res: Response) => {
    try {
        const place = await PopularPlace.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!place) {
            return res.status(404).json({ success: false, error: 'Popular place not found' });
        }
        return res.json({ success: true, data: place });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Failed to update popular place' });
    }
});

// DELETE /api/popular-places/:id
miscRoutes.delete('/popular-places/:id', async (req: Request, res: Response) => {
    try {
        const place = await PopularPlace.findByIdAndDelete(req.params.id);
        if (!place) {
            return res.status(404).json({ success: false, error: 'Popular place not found' });
        }
        return res.json({ success: true, data: { deleted: true } });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Failed to delete popular place' });
    }
});

// --- Promo Codes ---
// POST /api/promo-codes/validate
miscRoutes.post('/promo-codes/validate', async (req: Request, res: Response) => {
    try {
        const { code, orderTotal } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, error: 'Promo code is required' });
        }

        const promoCode = await PromoCode.findOne({ code: code.toUpperCase().trim() });
        if (!promoCode) {
            return res.status(404).json({ success: false, error: 'Invalid promo code' });
        }

        const now = new Date();
        if (!promoCode.isActive) return res.status(400).json({ success: false, error: 'This promo code is no longer active' });
        if (now < promoCode.validFrom) return res.status(400).json({ success: false, error: 'This promo code is not yet active' });
        if (now > promoCode.validUntil) return res.status(400).json({ success: false, error: 'This promo code has expired' });
        if (promoCode.maxUses > 0 && promoCode.usedCount >= promoCode.maxUses) return res.status(400).json({ success: false, error: 'This promo code has reached its maximum uses' });
        if ((orderTotal || 0) < promoCode.minimumOrder) return res.status(400).json({ success: false, error: `Minimum order of $${promoCode.minimumOrder} required` });

        const discount = promoCode.discountType === 'percentage'
            ? ((orderTotal || 0) * promoCode.discountValue) / 100
            : Math.min(promoCode.discountValue, orderTotal || 0);

        return res.json({
            success: true,
            data: {
                code: promoCode.code,
                description: promoCode.description,
                discountType: promoCode.discountType,
                discountValue: promoCode.discountValue,
                discount,
                newTotal: Math.max(0, (orderTotal || 0) - discount),
            },
        });
    } catch (error: any) {
        console.error('Error validating promo code:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to validate promo code' });
    }
});

// --- Drivers ---
// GET /api/drivers
miscRoutes.get('/drivers', async (_req: Request, res: Response) => {
    try {
        const drivers = await Driver.find({ status: 'active' }).lean();
        return res.json({ success: true, data: drivers });
    } catch (error) {
        console.error('Error fetching drivers:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch drivers' });
    }
});

// POST /api/drivers
miscRoutes.post('/drivers', async (req: Request, res: Response) => {
    try {
        const driver = await Driver.create(req.body);
        return res.status(201).json({ success: true, data: driver });
    } catch (error: any) {
        console.error('Error creating driver:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to create driver' });
    }
});

// --- Geocode ---
// GET /api/geocode
miscRoutes.get('/geocode', async (req: Request, res: Response) => {
    try {
        const { address } = req.query;

        if (!address) {
            return res.status(400).json({ success: false, error: 'Address is required' });
        }

        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            return res.json({
                success: true,
                data: {
                    lat: 30.3322,
                    lng: -81.6557,
                    formattedAddress: address as string,
                    source: 'fallback',
                },
            });
        }

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address as string)}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.status !== 'OK' || !data.results[0]) {
            return res.json({
                success: true,
                data: {
                    lat: 30.3322,
                    lng: -81.6557,
                    formattedAddress: address as string,
                    source: 'fallback',
                },
            });
        }

        const result = data.results[0];
        return res.json({
            success: true,
            data: {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                formattedAddress: result.formatted_address,
                source: 'google',
            },
        });
    } catch (error: any) {
        console.error('Geocode error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Geocoding failed' });
    }
});

// --- File Upload ---
// POST /api/upload
miscRoutes.post('/upload', async (req: Request, res: Response) => {
    try {
        // For file upload, we'll use multer which will be configured separately
        // This is a placeholder that handles base64-encoded files in JSON body
        const { filename, data, contentType } = req.body;

        if (!data) {
            return res.status(400).json({ success: false, error: 'No file data provided' });
        }

        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(process.cwd(), 'uploads');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const ext = filename?.split('.').pop() || 'jpg';
        const newFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = path.join(uploadsDir, newFilename);

        const buffer = Buffer.from(data, 'base64');
        fs.writeFileSync(filePath, buffer);

        const fileUrl = `/uploads/${newFilename}`;

        return res.json({
            success: true,
            data: { url: fileUrl, filename: newFilename },
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Upload failed' });
    }
});

// --- Cron ---
// GET /api/cron/reminders
miscRoutes.get('/cron/reminders', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        console.log('Processing automated reminders...');
        const results = await processReminders();
        console.log(`Processed ${results.processed} reminders`);

        return res.json({
            success: true,
            message: `Processed ${results.processed} reminders`,
            data: results,
        });
    } catch (error: any) {
        console.error('Error processing reminders:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to process reminders' });
    }
});

// --- Notifications ---
// POST /api/notifications/send-email (admin only)
miscRoutes.post('/notifications/send-email', requireAuth, async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }

        const { to, subject, html } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ success: false, error: 'Missing required fields: to, subject, html' });
        }

        const sent = await sendEmail({ to, subject, html });
        return res.json({
            success: sent,
            message: sent ? 'Email sent successfully' : 'Failed to send email',
        });
    } catch (error: any) {
        console.error('Send email error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to send email' });
    }
});

// POST /api/notifications/send-sms (admin only)
miscRoutes.post('/notifications/send-sms', requireAuth, async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }

        const { to, message } = req.body;

        if (!to || !message) {
            return res.status(400).json({ success: false, error: 'Missing required fields: to, message' });
        }

        const sent = await sendSMS({ to, message });
        return res.json({
            success: sent,
            message: sent ? 'SMS sent successfully' : 'Failed to send SMS',
        });
    } catch (error: any) {
        console.error('Send SMS error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to send SMS' });
    }
});

// --- Pricing (public) ---
// GET /api/pricing
miscRoutes.get('/pricing', async (_req: Request, res: Response) => {
    try {
        const { default: PricingRule } = await import('../models/PricingRule');
        const pricing = await PricingRule.findOne({ isActive: true }).lean();
        return res.json({ success: true, data: pricing });
    } catch (error) {
        console.error('Error fetching pricing:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch pricing' });
    }
});
