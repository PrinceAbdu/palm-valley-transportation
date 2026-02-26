import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRideRequest extends Document {
    bookingId: mongoose.Types.ObjectId;
    offeredTo?: mongoose.Types.ObjectId;
    acceptedBy?: mongoose.Types.ObjectId;
    declinedBy: mongoose.Types.ObjectId[];
    offerExpiresAt?: Date;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    createdAt: Date;
    updatedAt: Date;
}

const RideRequestSchema = new Schema<IRideRequest>(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
        offeredTo: { type: Schema.Types.ObjectId, ref: 'Driver' },
        acceptedBy: { type: Schema.Types.ObjectId, ref: 'Driver' },
        declinedBy: [{ type: Schema.Types.ObjectId, ref: 'Driver' }],
        offerExpiresAt: Date,
        status: { type: String, enum: ['pending', 'accepted', 'declined', 'expired'], default: 'pending' },
    },
    { timestamps: true }
);

RideRequestSchema.index({ offeredTo: 1, status: 1 });
RideRequestSchema.index({ offerExpiresAt: 1 });

const RideRequest: Model<IRideRequest> =
    mongoose.models.RideRequest || mongoose.model<IRideRequest>('RideRequest', RideRequestSchema);

export default RideRequest;
