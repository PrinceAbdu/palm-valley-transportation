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
const PromoCodeSchema = new mongoose_1.Schema({
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
    applicableVehicles: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Vehicle' }],
    applicableTripTypes: [{ type: String, enum: ['one_way', 'round_trip', 'hourly'] }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
PromoCodeSchema.methods.isValid = function (orderTotal) {
    const now = new Date();
    if (!this.isActive)
        return { valid: false, error: 'This promo code is no longer active' };
    if (now < this.validFrom)
        return { valid: false, error: 'This promo code is not yet active' };
    if (now > this.validUntil)
        return { valid: false, error: 'This promo code has expired' };
    if (this.maxUses > 0 && this.usedCount >= this.maxUses)
        return { valid: false, error: 'This promo code has reached its maximum uses' };
    if (orderTotal < this.minimumOrder)
        return { valid: false, error: `Minimum order of $${this.minimumOrder} required` };
    return { valid: true };
};
PromoCodeSchema.methods.calculateDiscount = function (orderTotal) {
    if (this.discountType === 'percentage')
        return (orderTotal * this.discountValue) / 100;
    return Math.min(this.discountValue, orderTotal);
};
const PromoCode = mongoose_1.default.models.PromoCode || mongoose_1.default.model('PromoCode', PromoCodeSchema);
exports.default = PromoCode;
