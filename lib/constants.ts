export const APP_NAME = 'Palm Valley Transportation';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Service Area
export const SERVICE_AREA_CENTER = {
    lat: parseFloat(process.env.SERVICE_AREA_CENTER_LAT || '30.3322'),
    lng: parseFloat(process.env.SERVICE_AREA_CENTER_LNG || '-81.6557'),
};

export const SERVICE_AREA_RADIUS = parseFloat(
    process.env.SERVICE_AREA_RADIUS_MILES || '50'
);

// Booking Statuses
export const BOOKING_STATUS = {
    DRAFT: 'draft',
    PENDING_PAYMENT: 'pending_payment',
    PAID_PENDING_CONFIRMATION: 'paid_pending_confirmation',
    CONFIRMED: 'confirmed',
    DRIVER_ASSIGNED: 'driver_assigned',
    EN_ROUTE: 'en_route',
    ARRIVED: 'arrived',
    PICKED_UP: 'picked_up',
    COMPLETED: 'completed',
    DECLINED: 'declined',
    CANCELLED_BY_RIDER: 'cancelled_by_rider',
    CANCELLED_BY_ADMIN: 'cancelled_by_admin',
    NO_SHOW: 'no_show',
    REFUNDED: 'refunded',
    PARTIAL_REFUND: 'partial_refund',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

// User Roles
export const USER_ROLES = {
    RIDER: 'rider',
    DRIVER: 'driver',
    ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Trip Types
export const TRIP_TYPES = {
    ONE_WAY: 'one_way',
    ROUND_TRIP: 'round_trip',
    HOURLY: 'hourly',
} as const;

export type TripType = typeof TRIP_TYPES[keyof typeof TRIP_TYPES];

// Pricing
export const DEFAULT_PRICING = {
    BASE_FARE: 15,
    PER_MILE: 2.5,
    PER_MINUTE: 0.5,
    MINIMUM_FARE: 25,
    AIRPORT_FEE: 10,
    MEET_GREET_FEE: 20,
    HOURLY_RATE: 60,
    MINIMUM_HOURLY_HOURS: 2,
};
