"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInServiceArea = isInServiceArea;
exports.validateServiceArea = validateServiceArea;
const constants_1 = require("../constants");
// Haversine formula
function calculateDistanceBetween(lat1, lng1, lat2, lng2) {
    const R = 3959;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function toRad(deg) {
    return deg * (Math.PI / 180);
}
function isInServiceArea(lat, lng) {
    const distance = calculateDistanceBetween(constants_1.SERVICE_AREA.center.lat, constants_1.SERVICE_AREA.center.lng, lat, lng);
    return distance <= constants_1.SERVICE_AREA.radiusMiles;
}
function validateServiceArea(pickupLat, pickupLng, dropoffLat, dropoffLng) {
    if (!isInServiceArea(pickupLat, pickupLng)) {
        return {
            valid: false,
            error: `Pickup location is outside our service area (${constants_1.SERVICE_AREA.name})`,
        };
    }
    if (dropoffLat !== undefined && dropoffLng !== undefined) {
        if (!isInServiceArea(dropoffLat, dropoffLng)) {
            return {
                valid: false,
                error: `Dropoff location is outside our service area (${constants_1.SERVICE_AREA.name})`,
            };
        }
    }
    return { valid: true };
}
