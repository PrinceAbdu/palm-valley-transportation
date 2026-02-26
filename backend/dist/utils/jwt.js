"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.generateResetToken = generateResetToken;
exports.verifyResetToken = verifyResetToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN
    });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    catch {
        return null;
    }
}
function generateResetToken(userId) {
    return jsonwebtoken_1.default.sign({ userId, type: 'reset' }, env_1.env.JWT_SECRET, {
        expiresIn: '1h'
    });
}
function verifyResetToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if (decoded.type !== 'reset')
            return null;
        return { userId: decoded.userId };
    }
    catch {
        return null;
    }
}
