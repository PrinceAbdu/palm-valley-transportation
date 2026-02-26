"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReminders = processReminders;
const Booking_1 = __importDefault(require("../models/Booking"));
const sms_service_1 = require("./sms.service");
const email_service_1 = require("./email.service");
async function processReminders() {
    let processed = 0;
    let errors = 0;
    try {
        const now = new Date();
        // 24-hour reminders
        const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const twentyThreeHoursLater = new Date(now.getTime() + 23 * 60 * 60 * 1000);
        const bookings24h = await Booking_1.default.find({
            status: { $in: ['confirmed', 'driver_assigned'] },
            'remindersSent.24h': { $ne: true },
        }).populate('riderId', 'firstName lastName email phone notificationPreferences');
        for (const booking of bookings24h) {
            try {
                const scheduledDT = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
                if (scheduledDT >= twentyThreeHoursLater && scheduledDT <= twentyFourHoursLater) {
                    const rider = booking.riderId;
                    if (rider?.phone) {
                        await (0, sms_service_1.sendReminderSMS)(booking, rider.phone, 24);
                    }
                    if (rider?.email) {
                        await (0, email_service_1.sendEmail)({
                            to: rider.email,
                            subject: `Ride Reminder - ${booking.bookingNumber}`,
                            html: `<p>Your ride is tomorrow! Booking ${booking.bookingNumber} pickup at ${booking.scheduledTime}.</p>`,
                        });
                    }
                    booking.remindersSent = { ...booking.remindersSent, '24h': true };
                    await booking.save();
                    processed++;
                }
            }
            catch (error) {
                errors++;
                console.error(`Error processing 24h reminder for ${booking.bookingNumber}:`, error);
            }
        }
        // 2-hour reminders
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const oneHourLater = new Date(now.getTime() + 1 * 60 * 60 * 1000);
        const bookings2h = await Booking_1.default.find({
            status: { $in: ['confirmed', 'driver_assigned'] },
            'remindersSent.2h': { $ne: true },
        }).populate('riderId', 'firstName lastName email phone notificationPreferences');
        for (const booking of bookings2h) {
            try {
                const scheduledDT = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
                if (scheduledDT >= oneHourLater && scheduledDT <= twoHoursLater) {
                    const rider = booking.riderId;
                    if (rider?.phone) {
                        await (0, sms_service_1.sendReminderSMS)(booking, rider.phone, 2);
                    }
                    booking.remindersSent = { ...booking.remindersSent, '2h': true };
                    await booking.save();
                    processed++;
                }
            }
            catch (error) {
                errors++;
                console.error(`Error processing 2h reminder for ${booking.bookingNumber}:`, error);
            }
        }
    }
    catch (error) {
        console.error('Error in processReminders:', error);
    }
    return { processed, errors };
}
