"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyBookingCreated = notifyBookingCreated;
exports.notifyDriverAssigned = notifyDriverAssigned;
exports.notifyStatusUpdate = notifyStatusUpdate;
exports.notifyCancellation = notifyCancellation;
const email_service_1 = require("./email.service");
const sms_service_1 = require("./sms.service");
async function notifyBookingCreated(booking, preferences) {
    try {
        const rider = booking.riderId;
        const email = rider?.email || booking.guestEmail;
        const phone = rider?.phone || booking.guestPhone;
        if (email && (preferences?.email !== false)) {
            await (0, email_service_1.sendBookingConfirmation)(booking, email);
        }
        if (phone && (preferences?.sms !== false)) {
            await (0, sms_service_1.sendBookingConfirmationSMS)(booking, phone);
        }
    }
    catch (error) {
        console.error('Error sending booking notification:', error);
    }
}
async function notifyDriverAssigned(booking, driverName, preferences) {
    try {
        const rider = booking.riderId;
        const email = rider?.email;
        const phone = rider?.phone;
        if (email && (preferences?.email !== false)) {
            await (0, email_service_1.sendDriverAssigned)(booking, driverName, email);
        }
        if (phone && (preferences?.sms !== false)) {
            await (0, sms_service_1.sendDriverAssignedSMS)(booking, driverName, phone);
        }
    }
    catch (error) {
        console.error('Error sending driver assigned notification:', error);
    }
}
async function notifyStatusUpdate(booking, status, preferences) {
    try {
        const rider = booking.riderId;
        const email = rider?.email;
        if (email && (preferences?.email !== false)) {
            await (0, email_service_1.sendStatusUpdate)(booking, status, email);
        }
    }
    catch (error) {
        console.error('Error sending status update notification:', error);
    }
}
async function notifyCancellation(booking, refundAmount, preferences) {
    try {
        const rider = booking.riderId;
        const phone = rider?.phone;
        if (phone && (preferences?.sms !== false)) {
            await (0, sms_service_1.sendCancellationSMS)(booking, phone);
        }
    }
    catch (error) {
        console.error('Error sending cancellation notification:', error);
    }
}
