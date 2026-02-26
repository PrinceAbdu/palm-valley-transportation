import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPromoCode extends Document {
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minimumOrder: number;
    maxUses: number;
    usedCount: number;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
    applicableVehicles: mongoose.Types.ObjectId[];
    applicableTripTypes: string[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        description: { type: String, required: true },
        discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
        discountValue: { type: Number, required: true, min: 0 },
        minimumOrder: { type: Number, default: 0 },
        maxUses: { type: Number, default: 0 },
        usedCount: { type: Number, default: 0 },
        validFrom: { type: Date, required: true },
        validUntil: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        applicableVehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
        applicableTripTypes: [{ type: String, enum: ['one_way', 'round_trip', 'hourly'] }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

PromoCodeSchema.methods.isValid = function (orderTotal: number): { valid: boolean; error?: string } {
    const now = new Date();
    if (!this.isActive) return { valid: false, error: 'This promo code is no longer active' };
    if (now < this.validFrom) return { valid: false, error: 'This promo code is not yet active' };
    if (now > this.validUntil) return { valid: false, error: 'This promo code has expired' };
    if (this.maxUses > 0 && this.usedCount >= this.maxUses) return { valid: false, error: 'This promo code has reached its maximum uses' };
    if (orderTotal < this.minimumOrder) return { valid: false, error: `Minimum order of $${this.minimumOrder} required` };
    return { valid: true };
};

PromoCodeSchema.methods.calculateDiscount = function (orderTotal: number): number {
    if (this.discountType === 'percentage') return (orderTotal * this.discountValue) / 100;
    return Math.min(this.discountValue, orderTotal);
};

const PromoCode: Model<IPromoCode> =
    mongoose.models.PromoCode || mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);

export default PromoCode;
