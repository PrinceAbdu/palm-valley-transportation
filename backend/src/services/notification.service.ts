import { sendBookingConfirmation, sendDriverAssigned, sendStatusUpdate } from './email.service';
import { sendBookingConfirmationSMS, sendDriverAssignedSMS, sendCancellationSMS } from './sms.service';

interface NotificationPreferences {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
}

export async function notifyBookingCreated(booking: any, preferences?: NotificationPreferences): Promise<void> {
    try {
        const rider = booking.riderId;
        const email = rider?.email || booking.guestEmail;
        const phone = rider?.phone || booking.guestPhone;

        if (email && (preferences?.email !== false)) {
            await sendBookingConfirmation(booking, email);
        }

        if (phone && (preferences?.sms !== false)) {
            await sendBookingConfirmationSMS(booking, phone);
        }
    } catch (error) {
        console.error('Error sending booking notification:', error);
    }
}

export async function notifyDriverAssigned(booking: any, driverName: string, preferences?: NotificationPreferences): Promise<void> {
    try {
        const rider = booking.riderId;
        const email = rider?.email;
        const phone = rider?.phone;

        if (email && (preferences?.email !== false)) {
            await sendDriverAssigned(booking, driverName, email);
        }

        if (phone && (preferences?.sms !== false)) {
            await sendDriverAssignedSMS(booking, driverName, phone);
        }
    } catch (error) {
        console.error('Error sending driver assigned notification:', error);
    }
}

export async function notifyStatusUpdate(booking: any, status: string, preferences?: NotificationPreferences): Promise<void> {
    try {
        const rider = booking.riderId;
        const email = rider?.email;

        if (email && (preferences?.email !== false)) {
            await sendStatusUpdate(booking, status, email);
        }
    } catch (error) {
        console.error('Error sending status update notification:', error);
    }
}

export async function notifyCancellation(booking: any, refundAmount: number, preferences?: NotificationPreferences): Promise<void> {
    try {
        const rider = booking.riderId;
        const phone = rider?.phone;

        if (phone && (preferences?.sms !== false)) {
            await sendCancellationSMS(booking, phone);
        }
    } catch (error) {
        console.error('Error sending cancellation notification:', error);
    }
}
