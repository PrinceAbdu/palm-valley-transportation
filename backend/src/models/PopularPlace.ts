import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPopularPlace extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    icon: string;
    imageUrl?: string;
    mapLink?: string;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const popularPlaceSchema = new Schema<IPopularPlace>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        icon: { type: String, default: '📍' },
        imageUrl: String,
        mapLink: String,
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const PopularPlace: Model<IPopularPlace> =
    mongoose.models.PopularPlace || mongoose.model<IPopularPlace>('PopularPlace', popularPlaceSchema);

export default PopularPlace;
