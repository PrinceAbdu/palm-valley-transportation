import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPricingRule extends Document {
    baseFare: number;
    perMile: number;
    perMinute: number;
    minimumFare: number;
    airportFee: number;
    meetGreetFee: number;
    hourlyRate: number;
    minimumHours: number;
    peakHours: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        multiplier: number;
    }>;
    isActive: boolean;
    effectiveFrom: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PricingRuleSchema = new Schema<IPricingRule>(
    {
        baseFare: { type: Number, required: true, default: 15 },
        perMile: { type: Number, required: true, default: 2.5 },
        perMinute: { type: Number, required: true, default: 0.5 },
        minimumFare: { type: Number, required: true, default: 25 },
        airportFee: { type: Number, required: true, default: 10 },
        meetGreetFee: { type: Number, required: true, default: 20 },
        hourlyRate: { type: Number, required: true, default: 60 },
        minimumHours: { type: Number, required: true, default: 2 },
        peakHours: [{
            dayOfWeek: { type: Number, min: 0, max: 6 },
            startTime: String,
            endTime: String,
            multiplier: { type: Number, min: 1.0, default: 1.5 },
        }],
        isActive: { type: Boolean, default: true },
        effectiveFrom: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const PricingRule: Model<IPricingRule> =
    mongoose.models.PricingRule || mongoose.model<IPricingRule>('PricingRule', PricingRuleSchema);

export default PricingRule;
