import request from 'supertest';
import express from 'express';
import { router } from '../src/routes/index';
import { SurveyAnalytics } from '../src/services/analytics';
import { getDb, getRedisClient } from '../src/db';

// Mock the database and Redis modules
jest.mock('../src/db');
jest.mock('../src/services/analytics');

const mockGetDb = getDb as jest.MockedFunction<typeof getDb>;
const mockGetRedisClient = getRedisClient as jest.MockedFunction<typeof getRedisClient>;
const MockSurveyAnalytics = SurveyAnalytics as jest.MockedClass<typeof SurveyAnalytics>;

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api', router);

describe('Routes', () => {
  let mockDb: any;
  let mockRedisClient: any;
  let mockSurveyAnalytics: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock database
    mockDb = {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        insertOne: jest.fn()
      })
    };

    // Setup mock Redis client
    mockRedisClient = {
      ping: jest.fn()
    };

    // Setup mock SurveyAnalytics
    mockSurveyAnalytics = {
      getQuestionStats: jest.fn(),
      updateStatsCache: jest.fn(),
      processTextResponses: jest.fn()
    };

    // Mock the getter functions
    mockGetDb.mockReturnValue(mockDb);
    mockGetRedisClient.mockReturnValue(mockRedisClient);
    MockSurveyAnalytics.mockImplementation(() => mockSurveyAnalytics);

    // Always mock background operations to resolve immediately
    mockSurveyAnalytics.updateStatsCache.mockResolvedValue(undefined);
    mockSurveyAnalytics.processTextResponses.mockResolvedValue(undefined);
  });

  describe('GET /api/stats/:surveyId/:questionId', () => {
    it('should return stats for valid survey and question', async () => {
      const mockStats = {
        type: 'number',
        count: 5,
        average: 7.2,
        min: 1,
        max: 10,
        median: 7,
        mode: [7],
        percentile25: 5,
        percentile75: 9,
        values: [1, 5, 7, 7, 10]
      };

      mockSurveyAnalytics.getQuestionStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/stats/survey123/question456')
        .expect(200);

      expect(response.body).toEqual(mockStats);
      expect(mockSurveyAnalytics.getQuestionStats).toHaveBeenCalledWith('survey123', 'question456');
    });

    it('should return 500 when SurveyAnalytics throws an error', async () => {
      const errorMessage = 'Survey not found';
      mockSurveyAnalytics.getQuestionStats.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/api/stats/survey123/question456')
        .expect(500);

      expect(response.body).toEqual({ error: errorMessage });
    });

    it.skip('should return 500 when database is not initialized', async () => {
      mockGetDb.mockImplementation(() => {
        throw new Error('Database is not initialized!');
      });

      const response = await request(app)
        .get('/api/stats/survey123/question456')
        .expect(500);

      expect(response.body).toEqual({ error: 'Database is not initialized!' });
    });
  });

  describe('POST /api/responses', () => {
    const mockResponse = {
      surveyId: 'survey123',
      userId: 'user456',
      answers: {
        q1: 5,
        q2: 'This is a text response'
      },
      createdAt: new Date().toISOString()
    };

    it('should create a new response successfully', async () => {
      const mockInsertResult = {
        insertedId: 'response789'
      };

      mockDb.collection('responses').insertOne.mockResolvedValue(mockInsertResult);

      const response = await request(app)
        .post('/api/responses')
        .send(mockResponse)
        .expect(201);

      expect(response.body).toEqual({
        ...mockResponse,
        id: 'response789'
      });

      expect(mockDb.collection('responses').insertOne).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle database insertion errors', async () => {
      const errorMessage = 'Database connection failed';
      mockDb.collection('responses').insertOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/api/responses')
        .send(mockResponse)
        .expect(500);

      expect(response.body).toEqual({ error: errorMessage });
    });

    it('should handle missing surveyId in response', async () => {
      const incompleteResponse = {
        userId: 'user456',
        answers: { q1: 5 }
        // Missing surveyId
      };

      const mockInsertResult = {
        insertedId: 'response789'
      };
      mockDb.collection('responses').insertOne.mockResolvedValue(mockInsertResult);

      const response = await request(app)
        .post('/api/responses')
        .send(incompleteResponse)
        .expect(201);

      expect(response.body).toEqual({
        ...incompleteResponse,
        id: 'response789'
      });
    });
  });

  describe('GET /api/surveys/:id', () => {
    it('should return survey when found', async () => {
      const mockSurvey = {
        _id: 'survey123',
        title: 'Test Survey',
        description: 'A test survey',
        questions: [
          {
            id: 'q1',
            text: 'How are you?',
            type: 'number'
          }
        ]
      };

      mockDb.collection('surveys').findOne.mockResolvedValue(mockSurvey);

      const response = await request(app)
        .get('/api/surveys/survey123')
        .expect(200);

      expect(response.body).toEqual(mockSurvey);
      expect(mockDb.collection('surveys').findOne).toHaveBeenCalledWith({ _id: 'survey123' });
    });

    it('should return 404 when survey not found', async () => {
      mockDb.collection('surveys').findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/surveys/nonexistent')
        .expect(404);

      expect(response.body).toEqual({ error: 'Survey not found' });
    });

    it('should return 500 when database error occurs', async () => {
      const errorMessage = 'Database connection failed';
      mockDb.collection('surveys').findOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/api/surveys/survey123')
        .expect(500);

      expect(response.body).toEqual({ error: errorMessage });
    });
  });

  describe('GET /api/health', () => {
    it('should return healthy status when Redis is available', async () => {
      mockRedisClient.ping.mockResolvedValue('PONG');

      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String)
      });
      expect(mockRedisClient.ping).toHaveBeenCalled();
    });

    it('should return unhealthy status when Redis is unavailable', async () => {
      const errorMessage = 'Redis connection failed';
      mockRedisClient.ping.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/api/health')
        .expect(500);

      expect(response.body).toEqual({
        status: 'unhealthy',
        error: errorMessage
      });
    });

    it('should return unhealthy status when Redis client is not initialized', async () => {
      mockGetRedisClient.mockImplementation(() => {
        throw new Error('Cache DB is not initialized!');
      });

      const response = await request(app)
        .get('/api/health')
        .expect(500);

      expect(response.body).toEqual({
        status: 'unhealthy',
        error: 'Cache DB is not initialized!'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const response = await request(app)
        .post('/api/responses')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });
  });

  describe('Route Parameters', () => {
    it('should handle special characters in survey and question IDs', async () => {
      const mockStats = { type: 'number', count: 1, average: 5 };
      mockSurveyAnalytics.getQuestionStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/stats/survey-123/question_456')
        .expect(200);

      expect(mockSurveyAnalytics.getQuestionStats).toHaveBeenCalledWith('survey-123', 'question_456');
    });

    it('should handle URL encoded parameters', async () => {
      const mockStats = { type: 'number', count: 1, average: 5 };
      mockSurveyAnalytics.getQuestionStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/stats/survey%20123/question%20456')
        .expect(200);

      expect(mockSurveyAnalytics.getQuestionStats).toHaveBeenCalledWith('survey 123', 'question 456');
    });
  });
}); 