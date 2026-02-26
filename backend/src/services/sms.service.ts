interface SMSParams {
    to: string;
    message: string;
}

let twilioClient: any = null;

function getTwilioClient() {
    if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const twilio = require('twilio');
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    return twilioClient;
}

export async function sendSMS(params: SMSParams): Promise<boolean> {
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
    } catch (error) {
        console.error('Error sending SMS:', error);
        return false;
    }
}

export async function sendBookingConfirmationSMS(booking: any, phone: string): Promise<boolean> {
    return sendSMS({
        to: phone,
        message: `Palm Valley Transportation: Booking ${booking.bookingNumber} confirmed. Pickup: ${booking.scheduledDate} at ${booking.scheduledTime}. Total: $${(booking.totalPrice || 0).toFixed(2)}`,
    });
}

export async function sendDriverAssignedSMS(booking: any, driverName: string, phone: string): Promise<boolean> {
    return sendSMS({
        to: phone,
        message: `Palm Valley Transportation: Driver ${driverName} has been assigned to your booking ${booking.bookingNumber}.`,
    });
}

export async function sendReminderSMS(booking: any, phone: string, hoursUntil: number): Promise<boolean> {
    return sendSMS({
        to: phone,
        message: `Palm Valley Transportation: Reminder - Your ride is in ${hoursUntil} hours. Booking: ${booking.bookingNumber}`,
    });
}

export async function sendCancellationSMS(booking: any, phone: string): Promise<boolean> {
    return sendSMS({
        to: phone,
        message: `Palm Valley Transportation: Booking ${booking.bookingNumber} has been cancelled.`,
    });
}
