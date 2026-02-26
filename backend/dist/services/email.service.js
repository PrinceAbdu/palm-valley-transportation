"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendBookingConfirmation = sendBookingConfirmation;
exports.sendDriverAssigned = sendDriverAssigned;
exports.sendStatusUpdate = sendStatusUpdate;
exports.sendPasswordReset = sendPasswordReset;
const nodemailer_1 = __importDefault(require("nodemailer"));
function createTransporter() {
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
}
async function sendEmail(params) {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.log('Email service not configured, skipping email send');
            console.log(`Would send email to ${params.to}: ${params.subject}`);
            return false;
        }
        const transporter = createTransporter();
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: params.to,
            subject: params.subject,
            html: params.html,
        });
        console.log(`Email sent to ${params.to}: ${params.subject}`);
        return true;
    }
    catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
async function sendBookingConfirmation(booking, userEmail) {
    return sendEmail({
        to: userEmail,
        subject: `Booking Confirmed - ${booking.bookingNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1e40af;">Booking Confirmed!</h1>
                <p>Your booking <strong>${booking.bookingNumber}</strong> has been confirmed.</p>
                <p><strong>Pickup:</strong> ${booking.pickup?.address}</p>
                <p><strong>Date:</strong> ${booking.scheduledDate} at ${booking.scheduledTime}</p>
                <p><strong>Total:</strong> $${(booking.totalPrice || 0).toFixed(2)}</p>
            </div>
        `,
    });
}
async function sendDriverAssigned(booking, driverName, userEmail) {
    return sendEmail({
        to: userEmail,
        subject: `Driver Assigned - ${booking.bookingNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1e40af;">Driver Assigned!</h1>
                <p>A driver has been assigned to your booking <strong>${booking.bookingNumber}</strong>.</p>
                <p><strong>Driver:</strong> ${driverName}</p>
            </div>
        `,
    });
}
async function sendStatusUpdate(booking, status, userEmail) {
    return sendEmail({
        to: userEmail,
        subject: `Booking Update - ${booking.bookingNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1e40af;">Booking Update</h1>
                <p>Your booking <strong>${booking.bookingNumber}</strong> status has been updated to: <strong>${status}</strong></p>
            </div>
        `,
    });
}
async function sendPasswordReset(email, resetUrl) {
    return sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1e40af;">Password Reset</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>This link expires in 1 hour.</p>
            </div>
        `,
    });
}
