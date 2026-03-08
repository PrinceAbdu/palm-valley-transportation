"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
require("express-async-errors");
const env_1 = require("./config/env");
const routes_1 = require("./routes");
const notFound_1 = require("./middleware/notFound");
const errorHandler_1 = require("./middleware/errorHandler");
function createApp() {
    const app = (0, express_1.default)();
    const allowedOrigins = env_1.env.CORS_ORIGIN.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    const isAllowedOrigin = (requestOrigin) => {
        return allowedOrigins.some((allowedOrigin) => {
            if (allowedOrigin === '*')
                return true;
            if (allowedOrigin === requestOrigin)
                return true;
            if (allowedOrigin.includes('*')) {
                const escapedPattern = allowedOrigin
                    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
                    .replace(/\*/g, '.*');
                return new RegExp(`^${escapedPattern}$`).test(requestOrigin);
            }
            return false;
        });
    };
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (isAllowedOrigin(origin))
                return callback(null, true);
            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }));
    app.use((0, helmet_1.default)());
    // Raw body for Stripe webhooks (must come before json parser)
    app.use('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }));
    app.use('/api/webhooks/stripe', express_1.default.raw({ type: 'application/json' }));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, morgan_1.default)('dev'));
    // Serve uploaded files
    app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
    app.get('/', (req, res) => {
        res.json({ message: 'Backend API is running' });
    });
    app.get('/favicon.ico', (req, res) => res.status(204));
    app.use('/api', routes_1.apiRoutes);
    app.use(notFound_1.notFound);
    app.use(errorHandler_1.errorHandler);
    return app;
}
