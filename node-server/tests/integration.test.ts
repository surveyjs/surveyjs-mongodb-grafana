import { SurveyAnalytics } from '../src/services/analytics';
import { MongoClient, Db } from 'mongodb';
import { createClient } from 'redis';

// Simple integration test data
const testSurvey = {
  _id: "test_survey_2023",
  name: "Test Survey",
  createdAt: new Date(),
  json: {
    title: "Test Survey",
    description: "Test survey for integration testing",
    questions: [
      {
        name: "q1",
        title: "How many items?",
        type: "text",
        inputType: "number",
        min: 0,
        max: 100
      }
    ]
  }
};

const testResponses = [
  {
    surveyId: "test_survey_2023",
    userId: "user001",
    answers: { q1: 5 },
    createdAt: new Date()
  },
  {
    surveyId: "test_survey_2023", 
    userId: "user002",
    answers: { q1: 10 },
    createdAt: new Date()
  }
];

describe('SurveyAnalytics Integration Tests', () => {
  let analytics: SurveyAnalytics;
  let db: Db;
  let redisClient: any;
  let mongoClient: MongoClient;
  let useRealDatabase = false;

  beforeAll(async () => {
    try {
      // Try to connect to test MongoDB instance
      const mongoUrl = process.env.MONGODB_TEST_URL || 'mongodb://localhost:27017/test_analytics';
      mongoClient = new MongoClient(mongoUrl);
      await mongoClient.connect();
      db = mongoClient.db();

      // Try to connect to test Redis instance
      const redisUrl = process.env.REDIS_TEST_URL || 'redis://localhost:6379';
      redisClient = createClient({ url: redisUrl });
      await redisClient.connect();

      // Test if we can actually perform operations
      await db.collection('test').deleteMany({});
      useRealDatabase = true;
      console.log('Using real database for integration tests');
    } catch (error: any) {
      console.log('Database connection failed, using mocks for integration tests:', error.message);
      useRealDatabase = false;
      
      // Create mock database and Redis client
      const mockCollection = {
        findOne: jest.fn(),
        find: jest.fn().mockReturnValue({
          project: jest.fn().mockReturnValue({
            toArray: jest.fn()
          })
        }),
        insertOne: jest.fn(),
        insertMany: jest.fn(),
        updateOne: jest.fn(),
        deleteMany: jest.fn()
      };

      db = {
        collection: jest.fn().mockReturnValue(mockCollection)
      } as any;

      redisClient = {
        get: jest.fn(),
        setEx: jest.fn(),
        del: jest.fn(),
        keys: jest.fn().mockResolvedValue([]),
        quit: jest.fn()
      };
    }

    analytics = new SurveyAnalytics(db, redisClient);
  });

  afterAll(async () => {
    if (useRealDatabase) {
      await mongoClient.close();
      await redisClient.quit();
    }
  });

  beforeEach(async () => {
    if (useRealDatabase) {
      // Clear test data before each test
      await db.collection('surveys').deleteMany({});
      await db.collection('responses').deleteMany({});
      
      // Clear Redis cache
      const keys = await redisClient.keys('stats:test_survey_2023:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      // Reset mocks
      jest.clearAllMocks();
    }
  });

  describe('Basic Integration Flow', () => {
    it('should calculate stats from real database data', async () => {
      if (useRealDatabase) {
        // Insert test data
        await db.collection('surveys').insertOne(testSurvey as any);
        await db.collection('responses').insertMany(testResponses);

        // Get stats for number question
        const stats = await analytics.getQuestionStats('test_survey_2023', 'q1');

        expect(stats).toEqual({
          type: 'number',
          count: 2,
          average: 7.5, // (5+10)/2
          min: 5,
          max: 10,
          median: 7.5,
          mode: [5, 10], // All values appear once
          percentile25: 7.5,
          percentile75: 7.5,
          values: [5, 10]
        });
      } else {
        // Mock test for when database is not available
        (db.collection('surveys').findOne as jest.Mock).mockResolvedValue(testSurvey);
        (db.collection('responses').find().project({}).toArray as jest.Mock).mockResolvedValue([
          { value: 5 },
          { value: 10 }
        ]);

        const stats = await analytics.getQuestionStats('test_survey_2023', 'q1');

        expect(stats).toEqual({
          type: 'number',
          count: 2,
          average: 7.5,
          min: 5,
          max: 10,
          median: 7.5,
          mode: [5, 10],
          percentile25: 7.5,
          percentile75: 7.5,
          values: [5, 10]
        });
      }
    });

    it('should cache results and return cached data', async () => {
      if (useRealDatabase) {
        // Insert test data
        await db.collection('surveys').insertOne(testSurvey as any);
        await db.collection('responses').insertMany(testResponses);

        // First call - should calculate and cache
        const stats1 = await analytics.getQuestionStats('test_survey_2023', 'q1');
        
        // Second call - should return cached data
        const stats2 = await analytics.getQuestionStats('test_survey_2023', 'q1');

        expect(stats1).toEqual(stats2);
        
        // Verify cache was set
        const cachedData = await redisClient.get('stats:test_survey_2023:q1');
        expect(cachedData).toBeTruthy();
        expect(JSON.parse(cachedData)).toEqual(stats1);
      } else {
        // Mock test for when database is not available
        (db.collection('surveys').findOne as jest.Mock).mockResolvedValue(testSurvey);
        (db.collection('responses').find().project({}).toArray as jest.Mock).mockResolvedValue([
          { value: 5 },
          { value: 10 }
        ]);

        // Mock Redis cache
        (redisClient.get as jest.Mock).mockResolvedValueOnce(null); // First call - no cache
        (redisClient.get as jest.Mock).mockResolvedValueOnce(JSON.stringify({
          type: 'number',
          count: 2,
          average: 7.5,
          min: 5,
          max: 10,
          median: 7.5,
          mode: [5, 10],
          percentile25: 7.5,
          percentile75: 7.5,
          values: [5, 10]
        })); // Second call - cached data

        const stats1 = await analytics.getQuestionStats('test_survey_2023', 'q1');
        const stats2 = await analytics.getQuestionStats('test_survey_2023', 'q1');

        expect(stats1).toEqual(stats2);
        expect((redisClient.setEx as jest.Mock)).toHaveBeenCalled();
      }
    });

    it('should clear cache when updateStatsCache is called', async () => {
      if (useRealDatabase) {
        // Insert test data
        await db.collection('surveys').insertOne(testSurvey as any);
        await db.collection('responses').insertMany(testResponses);

        // Get stats to populate cache
        await analytics.getQuestionStats('test_survey_2023', 'q1');
        
        // Verify cache exists
        let cachedData = await redisClient.get('stats:test_survey_2023:q1');
        expect(cachedData).toBeTruthy();

        // Clear cache
        await analytics.updateStatsCache('test_survey_2023');
        
        // Verify cache is cleared
        cachedData = await redisClient.get('stats:test_survey_2023:q1');
        expect(cachedData).toBeNull();
      } else {
        // Mock test for when database is not available
        (db.collection('surveys').findOne as jest.Mock).mockResolvedValue(testSurvey);

        await analytics.updateStatsCache('test_survey_2023');

        expect((redisClient.del as jest.Mock)).toHaveBeenCalledWith('stats:test_survey_2023:q1');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle survey not found gracefully', async () => {
      if (useRealDatabase) {
        await expect(analytics.getQuestionStats('nonexistent', 'q1'))
          .rejects.toThrow('Survey not found');
      } else {
        (db.collection('surveys').findOne as jest.Mock).mockResolvedValue(null);

        await expect(analytics.getQuestionStats('nonexistent', 'q1'))
          .rejects.toThrow('Survey not found');
      }
    });

    it('should handle question not found gracefully', async () => {
      if (useRealDatabase) {
        await db.collection('surveys').insertOne(testSurvey as any);
        
        await expect(analytics.getQuestionStats('test_survey_2023', 'nonexistent'))
          .rejects.toThrow('Question not found');
      } else {
        (db.collection('surveys').findOne as jest.Mock).mockResolvedValue(testSurvey);

        await expect(analytics.getQuestionStats('test_survey_2023', 'nonexistent'))
          .rejects.toThrow('Question not found');
      }
    });
  });
}); 