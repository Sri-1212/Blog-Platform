import app from './app';
import { connectDB } from './config/db';
import { config } from './config/env';

const startServer = async () => {
  await connectDB();

  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log(`📌 API Base URL: http://localhost:${PORT}/api/v1`);
  });
};

startServer();
