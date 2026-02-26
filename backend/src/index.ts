import { createApp } from './app';
import { connectDB } from './config/db';

let isConnected = false;

const handler = async (req: any, res: any) => {
  // Connect to DB if not already connected (for serverless)
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('DB connection failed:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }

  const app = createApp();
  return app(req, res);
};

export default handler;
