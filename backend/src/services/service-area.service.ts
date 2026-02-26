import { SERVICE_AREA } from '../constants';

// Haversine formula
function calculateDistanceBetween(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 3959;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

export function isInServiceArea(lat: number, lng: number): boolean {
    const distance = calculateDistanceBetween(
        SERVICE_AREA.center.lat,
        SERVICE_AREA.center.lng,
        lat,
        lng
    );
    return distance <= SERVICE_AREA.radiusMiles;
}

export function validateServiceArea(
    pickupLat: number,
    pickupLng: number,
    dropoffLat?: number,
    dropoffLng?: number
): { valid: boolean; error?: string } {
    if (!isInServiceArea(pickupLat, pickupLng)) {
        return {
            valid: false,
            error: `Pickup location is outside our service area (${SERVICE_AREA.name})`,
        };
    }

    if (dropoffLat !== undefined && dropoffLng !== undefined) {
        if (!isInServiceArea(dropoffLat, dropoffLng)) {
            return {
                valid: false,
                error: `Dropoff location is outside our service area (${SERVICE_AREA.name})`,
            };
        }
    }

    return { valid: true };
}
