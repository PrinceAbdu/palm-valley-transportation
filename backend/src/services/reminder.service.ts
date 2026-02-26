import Booking from '../models/Booking';
import { sendReminderSMS } from './sms.service';
import { sendEmail } from './email.service';

export async function processReminders(): Promise<{ processed: number; errors: number }> {
    let processed = 0;
    let errors = 0;

    try {
        const now = new Date();

        // 24-hour reminders
        const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const twentyThreeHoursLater = new Date(now.getTime() + 23 * 60 * 60 * 1000);

        const bookings24h = await Booking.find({
            status: { $in: ['confirmed', 'driver_assigned'] },
            'remindersSent.24h': { $ne: true },
        }).populate('riderId', 'firstName lastName email phone notificationPreferences');

        for (const booking of bookings24h) {
            try {
                const scheduledDT = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
                if (scheduledDT >= twentyThreeHoursLater && scheduledDT <= twentyFourHoursLater) {
                    const rider: any = booking.riderId;
                    if (rider?.phone) {
                        await sendReminderSMS(booking, rider.phone, 24);
                    }
                    if (rider?.email) {
                        await sendEmail({
                            to: rider.email,
                            subject: `Ride Reminder - ${booking.bookingNumber}`,
                            html: `<p>Your ride is tomorrow! Booking ${booking.bookingNumber} pickup at ${booking.scheduledTime}.</p>`,
                        });
                    }
                    booking.remindersSent = { ...booking.remindersSent, '24h': true };
                    await booking.save();
                    processed++;
                }
            } catch (error) {
                errors++;
                console.error(`Error processing 24h reminder for ${booking.bookingNumber}:`, error);
            }
        }

        // 2-hour reminders
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const oneHourLater = new Date(now.getTime() + 1 * 60 * 60 * 1000);

        const bookings2h = await Booking.find({
            status: { $in: ['confirmed', 'driver_assigned'] },
            'remindersSent.2h': { $ne: true },
        }).populate('riderId', 'firstName lastName email phone notificationPreferences');

        for (const booking of bookings2h) {
            try {
                const scheduledDT = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
                if (scheduledDT >= oneHourLater && scheduledDT <= twoHoursLater) {
                    const rider: any = booking.riderId;
                    if (rider?.phone) {
                        await sendReminderSMS(booking, rider.phone, 2);
                    }
                    booking.remindersSent = { ...booking.remindersSent, '2h': true };
                    await booking.save();
                    processed++;
                }
            } catch (error) {
                errors++;
                console.error(`Error processing 2h reminder for ${booking.bookingNumber}:`, error);
            }
        }
    } catch (error) {
        console.error('Error in processReminders:', error);
    }

    return { processed, errors };
}
