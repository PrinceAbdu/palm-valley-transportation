import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVehicle extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    type: string;
    vin?: string;
    licensePlate?: string;
    registrationNumber: string;
    maxPassengers: number;
    maxLuggage: number;
    basePrice: number;
    priceMultiplier: number;
    imageUrl?: string;
    features: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        type: { type: String, required: true, enum: ['sedan', 'suv', 'van', 'luxury'] },
        vin: {
            type: String,
            unique: true,
            trim: true,
            default: function (this: any) {
                return this.registrationNumber;
            },
        },
        licensePlate: {
            type: String,
            unique: true,
            trim: true,
            default: function (this: any) {
                return this.registrationNumber;
            },
        },
        registrationNumber: { type: String, required: true, unique: true, trim: true },
        maxPassengers: { type: Number, required: true, min: 1 },
        maxLuggage: { type: Number, required: true, min: 0 },
        basePrice: { type: Number, required: true, min: 0 },
        priceMultiplier: { type: Number, default: 1, min: 1 },
        imageUrl: String,
        features: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Vehicle: Model<IVehicle> =
    mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', vehicleSchema);

export default Vehicle;
