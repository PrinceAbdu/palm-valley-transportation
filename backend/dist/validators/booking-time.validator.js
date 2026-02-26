"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBookingTime = validateBookingTime;
exports.getTimeUntilRide = getTimeUntilRide;
const MINIMUM_ADVANCE_HOURS = 2;
const MAXIMUM_ADVANCE_DAYS = 90;
function validateBookingTime(scheduledDate, scheduledTime) {
    try {
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        const now = new Date();
        if (isNaN(scheduledDateTime.getTime())) {
            return { valid: false, error: 'Invalid date or time format' };
        }
        if (scheduledDateTime <= now) {
            return { valid: false, error: 'Cannot book rides in the past' };
        }
        const hoursUntilRide = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntilRide < MINIMUM_ADVANCE_HOURS) {
            return {
                valid: false,
                error: `Bookings must be made at least ${MINIMUM_ADVANCE_HOURS} hours in advance. For immediate rides, please call (904) 555-0100.`,
            };
        }
        const daysUntilRide = hoursUntilRide / 24;
        if (daysUntilRide > MAXIMUM_ADVANCE_DAYS) {
            return {
                valid: false,
                error: `Bookings can only be made up to ${MAXIMUM_ADVANCE_DAYS} days in advance`,
            };
        }
        return { valid: true };
    }
    catch (error) {
        return { valid: false, error: 'Error validating booking time' };
    }
}
function getTimeUntilRide(scheduledDate, scheduledTime) {
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    const now = new Date();
    const hoursUntil = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntil < 24) {
        return `${Math.floor(hoursUntil)} hours`;
    }
    else {
        const days = Math.floor(hoursUntil / 24);
        return `${days} day${days !== 1 ? 's' : ''}`;
    }
}
