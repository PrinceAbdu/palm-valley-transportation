"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = sendSMS;
exports.sendBookingConfirmationSMS = sendBookingConfirmationSMS;
exports.sendDriverAssignedSMS = sendDriverAssignedSMS;
exports.sendReminderSMS = sendReminderSMS;
exports.sendCancellationSMS = sendCancellationSMS;
let twilioClient = null;
function getTwilioClient() {
    if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const twilio = require('twilio');
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    return twilioClient;
}
async function sendSMS(params) {
    try {
        const client = getTwilioClient();
        if (!client) {
            console.log('Twilio not configured, skipping SMS');
            console.log(`Would send SMS to ${params.to}: ${params.message}`);
            return false;
        }
        await client.messages.create({
            body: params.message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: params.to,
        });
        console.log(`SMS sent to ${params.to}`);
        return true;
    }
    catch (error) {
        console.error('Error sending SMS:', error);
        return false;
    }
}
async function sendBookingConfirmationSMS(booking, phone) {
    return sendSMS({
        to: phone,
        message: `Palm Valley Transportation: Booking ${booking.bookingNumber} confirmed. Pickup: ${booking.scheduledDate} at ${booking.scheduledTime}. Total: $${(booking.totalPrice || 0).toFixed(2)}`,
    });
}
async function sendDriverAssignedSMS(booking, driverName, phone) {
    return sendSMS({
        to: phone,
        message: `Palm Valley Transportation: Driver ${driverName} has been assigned to your booking ${booking.bookingNumber}.`,
    });
}
async function sendReminderSMS(booking, phone, hoursUntil) {
    return sendSMS({
        to: phone,
        message: `Palm Valley Transportation: Reminder - Your ride is in ${hoursUntil} hours. Booking: ${booking.bookingNumber}`,
    });
}
async function sendCancellationSMS(booking, phone) {
    return sendSMS({
        to: phone,
        message: `Palm Valley Transportation: Booking ${booking.bookingNumber} has been cancelled.`,
    });
}
