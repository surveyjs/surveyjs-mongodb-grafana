import express from 'express';
import { router } from './routes';
import { router as grafana } from './routes/grafana';
import { connectToCache, connectToDatabase, getDb, getRedisClient } from './db';
// import bodyParser from 'body-parser';
import { MongoStorage } from './db-adapters/mongo';
import { SurveyStorage } from './db-adapters/survey-storage';

const apiBaseAddress = "/api";
const grafanaBaseAddress = "/grafana";

const app = express();
const PORT = process.env.PORT || 3000;

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(apiBaseAddress, router);
app.use(grafanaBaseAddress, grafana);

function getStorage(req: any): SurveyStorage {
  const storage = new MongoStorage(getDb());
  return storage;
}

function sendJsonResult(res: any, obj: any) {
  res.json(obj);
}

app.get(apiBaseAddress + "/getActive", (req, res) => {
  const storage = getStorage(req);
  storage.getSurveys((result: any) => {
    sendJsonResult(res, result);
  });
});

app.get(apiBaseAddress + "/getSurvey", (req, res) => {
  const storage = getStorage(req);
  const surveyId = req.query["surveyId"] as string;
  storage.getSurvey(surveyId, (result: any) => {
    sendJsonResult(res, result);
  });
});

app.get(apiBaseAddress + "/changeName", (req, res) => {
  const storage = getStorage(req);
  const id = req.query["id"] as string;
  const name = req.query["name"] as string;
  storage.changeName(id, name, (result: any) => {
    sendJsonResult(res, result);
  });
});

app.get(apiBaseAddress + "/create", (req, res) => {
  const storage = getStorage(req);
  const name = req.query["name"] as string;
  storage.addSurvey(name, (survey: any) => {
    sendJsonResult(res, survey);
  });
});

app.post(apiBaseAddress + "/changeJson", (req, res) => {
  const storage = getStorage(req);
  const id = req.body.id;
  const json = req.body.json;
  storage.storeSurvey(id, null, json, (survey: any) => {
    sendJsonResult(res, survey);
  });
});

app.get(apiBaseAddress + "/delete", (req, res) => {
  const storage = getStorage(req);
  const id = req.query["id"] as string;
  storage.deleteSurvey(id, () => {
    sendJsonResult(res, { id: id });
  });
});

app.get(apiBaseAddress + "/results", (req, res) => {
  const storage = getStorage(req);
  const postId = req.query["postId"] as string;
  storage.getResults(postId, (result: any) => {
    sendJsonResult(res, result);
  });
});

app.get(["/", "/about", "/run/*", "/edit/*", "/results/*"], (_, res) => {
  res.sendFile("index.html", { root: __dirname + "/../public" });
});

app.use(express.static(__dirname + "/../public"));

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
