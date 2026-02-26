import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
    _id: mongoose.Types.ObjectId;
    bookingNumber: string;
    riderId?: mongoose.Types.ObjectId;
    driverId?: mongoose.Types.ObjectId;
    vehicleId?: mongoose.Types.ObjectId;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    tripType: 'one_way' | 'round_trip' | 'hourly';
    pickup: {
        address: string;
        lat?: number;
        lng?: number;
    };
    dropoff?: {
        address: string;
        lat?: number;
        lng?: number;
    };
    scheduledDate: string;
    scheduledTime: string;
    returnDate?: string;
    returnTime?: string;
    passengers: number;
    luggage: number;
    hours?: number;
    specialRequests?: string;
    flightNumber?: string;
    isAirportRide: boolean;
    meetAndGreet: boolean;
    distance?: number;
    duration?: number;
    basePrice?: number;
    fees?: {
        airportFee?: number;
        meetGreetFee?: number;
        roundTripDiscount?: number;
    };
    totalPrice?: number;
    quotedPrice?: number;
    quoteStatus?: 'pending' | 'quoted' | 'accepted' | 'declined';
    quotedAt?: Date;
    stripePaymentUrl?: string;
    status: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentIntentId?: string;
    stripeSessionId?: string;
    refundAmount?: number;
    refundId?: string;
    cancelledAt?: Date;
    completedAt?: Date;
    remindersSent?: {
        '24h'?: boolean;
        '2h'?: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
    {
        bookingNumber: {
            type: String,
            unique: true,
        },
        riderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        driverId: {
            type: Schema.Types.ObjectId,
            ref: 'Driver',
        },
        vehicleId: {
            type: Schema.Types.ObjectId,
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
    },
    {
        timestamps: true,
    }
);

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
// bookingNumber already has unique:true which creates an index automatically

const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
