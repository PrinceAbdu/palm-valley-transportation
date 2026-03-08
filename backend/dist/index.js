"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
let isConnected = false;
const handler = async (req, res) => {
    // Connect to DB if not already connected (for serverless)
    if (!isConnected) {
        try {
            await (0, db_1.connectDB)();
            isConnected = true;
        }
        catch (error) {
            console.error('DB connection failed:', error);
            return res.status(500).json({ error: 'Database connection failed' });
        }
    }
    const app = (0, app_1.createApp)();
    return app(req, res);
};
exports.default = handler;
