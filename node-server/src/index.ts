import express from 'express';
import { router } from './routes';
import { router as grafana } from './routes/grafana';
import { connectToCache, connectToDatabase, getRedisClient } from './db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', router);
app.use('/grafana', grafana);

const cacheMiddleware = (key: string, ttl: number = 300) => {
  return async (req: any, res: any, next: any) => {
    try {
      const data = await getRedisClient().get(key);
      if (data) {
        return res.json(JSON.parse(data));
      }
      req.redisKey = key;
      req.redisTtl = ttl;
      next();
    } catch (err) {
      next();
    }
  };
};

const startServer = async () => {
  await connectToDatabase(process.env.MONGO_URI!)
      .then(() => console.log('Connected to MongoDB'))
      .catch(err => console.error('MongoDB connection error:', err));
  await connectToCache(process.env.REDIS_URL!)
      .then(() => console.log('Connected to Redis cache'))
      .catch(err => console.error('Redis cache connection error:', err));
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    // await redisClient.quit();
    // console.log('Redis client disconnected');
  } catch (err) {
    // console.error('Error disconnecting Redis client:', err);
  }
  process.exit(0);
});
process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  try {
    // await redisClient.quit();
    // console.log('Redis client disconnected');
  } catch (err) {
    // console.error('Error disconnecting Redis client:', err);
  }
  process.exit(0);
});
export default app;
