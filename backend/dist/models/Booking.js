"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bookingSchema = new mongoose_1.Schema({
    bookingNumber: {
        type: String,
        unique: true,
    },
    riderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    driverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Driver',
    },
    vehicleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vehicle',
    },
    guestName: String,
    guestEmail: String,
    guestPhone: String,
    tripType: {
        type: String,
        enum: ['one_way', 'round_trip', 'hourly'],
        required: true,
    },
    pickup: {
        address: { type: String, required: true },
        lat: Number,
        lng: Number,
    },
    dropoff: {
        address: String,
        lat: Number,
        lng: Number,
    },
    scheduledDate: {
        type: String,
        required: true,
    },
    scheduledTime: {
        type: String,
        required: true,
    },
    returnDate: String,
    returnTime: String,
    passengers: {
        type: Number,
        required: true,
        min: 1,
    },
    luggage: {
        type: Number,
        default: 0,
    },
    hours: Number,
    specialRequests: String,
    flightNumber: String,
    isAirportRide: {
        type: Boolean,
        default: false,
    },
    meetAndGreet: {
        type: Boolean,
        default: false,
    },
    distance: Number,
    duration: Number,
    basePrice: Number,
    fees: {
        airportFee: { type: Number, default: 0 },
        meetGreetFee: { type: Number, default: 0 },
        roundTripDiscount: { type: Number, default: 0 },
    },
    totalPrice: Number,
    quotedPrice: Number,
    quoteStatus: {
        type: String,
        enum: ['pending', 'quoted', 'accepted', 'declined'],
    },
    quotedAt: Date,
    stripePaymentUrl: String,
    status: {
        type: String,
        default: 'pending_payment',
    },
    paymentStatus: {
        type: String,
        default: 'unpaid',
    },
    paymentMethod: String,
    paymentIntentId: String,
    stripeSessionId: String,
    refundAmount: Number,
    refundId: String,
    cancelledAt: Date,
    completedAt: Date,
    remindersSent: {
        '24h': { type: Boolean, default: false },
        '2h': { type: Boolean, default: false },
    },
}, {
    timestamps: true,
});
// Generate booking number before save
bookingSchema.pre('save', function (next) {
    if (!this.bookingNumber) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.bookingNumber = `PVT-${timestamp}-${random}`;
    }
    next();
});
// Indexes
bookingSchema.index({ riderId: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingNumber: 1 });
const Booking = mongoose_1.default.models.Booking || mongoose_1.default.model('Booking', bookingSchema);
exports.default = Booking;
