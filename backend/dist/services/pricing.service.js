"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePrice = calculatePrice;
exports.calculateDistance = calculateDistance;
exports.estimateDuration = estimateDuration;
const constants_1 = require("../constants");
function calculatePrice(params) {
    const { tripType, distance, duration, hours, isAirportRide = false, meetAndGreet = false, vehicleMultiplier = 1, } = params;
    let baseFare = constants_1.DEFAULT_PRICING.BASE_FARE;
    let distanceCharge = 0;
    let timeCharge = 0;
    let airportFee = 0;
    let meetGreetFee = 0;
    let roundTripDiscount = 0;
    if (tripType === 'hourly') {
        const rentalHours = Math.max(hours || constants_1.DEFAULT_PRICING.MINIMUM_HOURS, constants_1.DEFAULT_PRICING.MINIMUM_HOURS);
        baseFare = constants_1.DEFAULT_PRICING.HOURLY_RATE * rentalHours;
    }
    else {
        distanceCharge = distance * constants_1.DEFAULT_PRICING.PER_MILE;
        timeCharge = duration * constants_1.DEFAULT_PRICING.PER_MINUTE;
    }
    if (isAirportRide)
        airportFee = constants_1.DEFAULT_PRICING.AIRPORT_FEE;
    if (meetAndGreet)
        meetGreetFee = constants_1.DEFAULT_PRICING.MEET_GREET_FEE;
    let subtotal = (baseFare + distanceCharge + timeCharge + airportFee + meetGreetFee) * vehicleMultiplier;
    if (tripType === 'round_trip') {
        const baseSubtotal = subtotal;
        subtotal = subtotal * 2;
        roundTripDiscount = baseSubtotal * 2 * constants_1.DEFAULT_PRICING.ROUND_TRIP_DISCOUNT;
        subtotal -= roundTripDiscount;
    }
    const totalPrice = Math.max(subtotal, constants_1.DEFAULT_PRICING.MINIMUM_FARE);
    return {
        baseFare,
        distanceCharge,
        timeCharge,
        airportFee,
        meetGreetFee,
        roundTripDiscount,
        vehicleMultiplier,
        totalPrice: Math.round(totalPrice * 100) / 100,
    };
}
// Haversine formula for distance calculation
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}
function toRad(deg) {
    return deg * (Math.PI / 180);
}
function estimateDuration(distance) {
    const avgSpeedMPH = 35;
    return Math.round((distance / avgSpeedMPH) * 60);
}
