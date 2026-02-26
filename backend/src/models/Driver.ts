import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriver extends Document {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    licenseNumber: string;
    licenseExpiry: Date;
    vehicleInfo?: {
        make: string;
        model: string;
        year: number;
        color: string;
        plateNumber: string;
    };
    status: 'active' | 'inactive' | 'suspended';
    isAvailable: boolean;
    rating: number;
    totalRides: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const driverSchema = new Schema<IDriver>(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true },
        licenseNumber: { type: String, required: true },
        licenseExpiry: { type: Date, required: true },
        vehicleInfo: {
            make: String,
            model: String,
            year: Number,
            color: String,
            plateNumber: String,
        },
        status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
        isAvailable: { type: Boolean, default: true },
        rating: { type: Number, default: 5, min: 0, max: 5 },
        totalRides: { type: Number, default: 0 },
        notes: String,
    },
    { timestamps: true }
);

const Driver: Model<IDriver> =
    mongoose.models.Driver || mongoose.model<IDriver>('Driver', driverSchema);

export default Driver;
