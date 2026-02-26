"use strict";
// Application constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PRICING = exports.TRIP_TYPES = exports.USER_ROLES = exports.BOOKING_STATUS = exports.SERVICE_AREA = exports.APP_NAME = void 0;
exports.APP_NAME = 'Palm Valley Transportation';
// Service area center (Jacksonville, FL area)
exports.SERVICE_AREA = {
    center: {
        lat: 30.3322,
        lng: -81.6557,
    },
    radiusMiles: 100,
    name: 'Jacksonville Metropolitan Area',
};
// Booking statuses
exports.BOOKING_STATUS = {
    PENDING_PAYMENT: 'pending_payment',
    PAID_PENDING_CONFIRMATION: 'paid_pending_confirmation',
    CONFIRMED: 'confirmed',
    DRIVER_ASSIGNED: 'driver_assigned',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED_BY_RIDER: 'cancelled_by_rider',
    CANCELLED_BY_DRIVER: 'cancelled_by_driver',
    CANCELLED_BY_ADMIN: 'cancelled_by_admin',
    DECLINED: 'declined',
    NO_SHOW: 'no_show',
};
// User roles
exports.USER_ROLES = {
    RIDER: 'rider',
    DRIVER: 'driver',
    ADMIN: 'admin',
};
// Trip types
exports.TRIP_TYPES = {
    ONE_WAY: 'one_way',
    ROUND_TRIP: 'round_trip',
    HOURLY: 'hourly',
};
// Default pricing
exports.DEFAULT_PRICING = {
    BASE_FARE: 15,
    PER_MILE: 2.50,
    PER_MINUTE: 0.50,
    MINIMUM_FARE: 25,
    AIRPORT_FEE: 10,
    MEET_GREET_FEE: 20,
    HOURLY_RATE: 60,
    MINIMUM_HOURS: 2,
    ROUND_TRIP_DISCOUNT: 0.10,
};
