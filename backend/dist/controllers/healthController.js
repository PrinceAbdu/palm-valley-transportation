"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.health = health;
const mongoose_1 = __importDefault(require("mongoose"));
function health(_req, res) {
    res.json({
        ok: true,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        mongo: {
            readyState: mongoose_1.default.connection.readyState
        }
    });
}
