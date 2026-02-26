"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
async function main() {
    await (0, db_1.connectDB)();
    const app = (0, app_1.createApp)();
    const server = app.listen(env_1.env.PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`[backend] listening on http://localhost:${env_1.env.PORT}`);
    });
    const shutdown = async () => {
        server.close(() => process.exit(0));
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[backend] failed to start', err);
    process.exit(1);
});
