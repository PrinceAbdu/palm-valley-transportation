
import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function main() {
  await connectDB();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on http://localhost:${env.PORT}`);
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

