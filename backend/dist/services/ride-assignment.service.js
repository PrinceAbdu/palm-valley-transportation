"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRideRequest = createRideRequest;
const Driver_1 = __importDefault(require("../models/Driver"));
const RideRequest_1 = __importDefault(require("../models/RideRequest"));
const OFFER_TIMEOUT_MINUTES = 5;
async function createRideRequest(bookingId) {
    // Find available drivers
    const availableDrivers = await Driver_1.default.find({
        status: 'active',
        isAvailable: true,
    }).lean();
    if (availableDrivers.length === 0) {
        return {
            success: false,
            message: 'No available drivers at this time',
        };
    }
    // Check for existing ride request
    let rideRequest = await RideRequest_1.default.findOne({ bookingId });
    if (rideRequest) {
        // Find a driver who hasn't declined
        const nextDriver = availableDrivers.find((d) => !rideRequest.declinedBy.some((id) => id.toString() === d._id.toString()));
        if (!nextDriver) {
            rideRequest.status = 'expired';
            await rideRequest.save();
            return {
                success: false,
                message: 'All available drivers have declined',
            };
        }
        rideRequest.offeredTo = nextDriver._id;
        rideRequest.offerExpiresAt = new Date(Date.now() + OFFER_TIMEOUT_MINUTES * 60 * 1000);
        rideRequest.status = 'pending';
        await rideRequest.save();
        return {
            success: true,
            message: `Offered to ${nextDriver.firstName} ${nextDriver.lastName}`,
            offeredTo: nextDriver._id.toString(),
        };
    }
    // Create new ride request
    const firstDriver = availableDrivers[0];
    rideRequest = await RideRequest_1.default.create({
        bookingId,
        offeredTo: firstDriver._id,
        offerExpiresAt: new Date(Date.now() + OFFER_TIMEOUT_MINUTES * 60 * 1000),
        status: 'pending',
    });
    return {
        success: true,
        message: `Offered to ${firstDriver.firstName} ${firstDriver.lastName}`,
        offeredTo: firstDriver._id.toString(),
    };
}
