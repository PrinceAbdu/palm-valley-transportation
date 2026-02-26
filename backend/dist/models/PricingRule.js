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
const PricingRuleSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
const PricingRule = mongoose_1.default.models.PricingRule || mongoose_1.default.model('PricingRule', PricingRuleSchema);
exports.default = PricingRule;
