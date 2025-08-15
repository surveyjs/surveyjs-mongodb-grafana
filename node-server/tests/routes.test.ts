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

  describe('POST /api/responses /api/post', () => {
    const mockResponse = {
      postId: 'survey123',
      surveyResult: {
        q1: 5,
        q2: 'This is a text response'
      },
    };

    it('should create a new response successfully', async () => {
      const mockInsertResult = {
        ...mockResponse,
        id: 'response789'
      };

      mockDb.collection('responses').insertOne.mockResolvedValue(mockInsertResult);

      const response = await request(app)
        .post('/api/post')
        .send(mockResponse)
        .expect(201);

      response.body.createdAt = expect.anything(); // createdAt should be a date, so we use a matcher
      expect(mockDb.collection('responses').insertOne).toHaveBeenCalledWith(expect.objectContaining(response.body));
      delete response.body.createdAt; // Remove createdAt for comparison

      expect(response.body).toEqual({
        surveyId: mockResponse.postId,
        answers: mockResponse.surveyResult,
        userId: "user_1001",
        id: 'response789'
      });

    });

    it.skip('should handle database insertion errors', async () => {
      const errorMessage = 'Database connection failed';
      mockDb.collection('responses').insertOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/api/post')
        .send(mockResponse)
        .expect(500);

      expect(response.body).toEqual({ error: errorMessage });
    });

    it('should handle missing surveyId in response', async () => {
      const incompleteResponse = {
        surveyResult: { q1: 5 }
        // Missing surveyId
      };

      const mockInsertResult = {
        id: 'response789'
      };
      mockDb.collection('responses').insertOne.mockResolvedValue(mockInsertResult);

      const response = await request(app)
        .post('/api/post')
        .send(incompleteResponse)
        .expect(201);

      delete response.body.createdAt; // Remove createdAt for comparison

      expect(response.body).toEqual({
        answers: { ...incompleteResponse.surveyResult },
        userId: "user_1001",
        id: 'response789'
      });
    });
  });

  describe('GET /api/surveys/:id', () => {
    it('should return survey when found', async () => {
      const mockSurvey = {
        _id: 'survey123',
        name: 'Test Survey',
        json: {
          title: 'Test Survey',
          description: 'A test survey',
          questions: [
            {
              id: 'q1',
              text: 'How are you?',
              type: 'number'
            }
          ]
        }
      };

      mockDb.collection('surveys').findOne.mockResolvedValue(mockSurvey);

      const response = await request(app)
        .get('/api/surveys/survey123')
        .expect(200);

      expect(response.body).toEqual(mockSurvey.json);
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
        .post('/api/post')
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

describe('Grafana Routes', () => {
  let app: express.Express;
  let mockDb: any;
  let mockRedisClient: any;
  let mockSurveyAnalytics: any;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    // Import the grafana router directly
    const { router: grafanaRouter } = require('../src/routes/grafana');
    app.use('/grafana', grafanaRouter);

    mockDb = {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        find: jest.fn().mockReturnValue({ toArray: jest.fn() }),
        countDocuments: jest.fn(),
      })
    };
    mockRedisClient = { get: jest.fn(), setEx: jest.fn(), del: jest.fn() };
    mockSurveyAnalytics = { getQuestionStats: jest.fn() };
    mockGetDb.mockReturnValue(mockDb);
    mockGetRedisClient.mockReturnValue(mockRedisClient);
    MockSurveyAnalytics.mockImplementation(() => mockSurveyAnalytics);
  });

  it('GET /grafana/ should return API info', async () => {
    const res = await request(app).get('/grafana/').expect(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.routes).toHaveProperty('query');
  });

  it('POST /grafana/search returns surveys list', async () => {
    // Mock some surveys in the db
    const mockSurveys = [
      { _id: 'id1', name: 'Survey 1', json: { title: 'Survey 1', id: 'id1' } },
      { _id: 'id2', name: 'Survey 2', json: { title: 'Survey 2', id: 'id2' } }
    ];
    mockDb.collection('surveys').find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockSurveys)
      })
    });
    const res = await request(app)
      .post('/grafana/search')
      .send({ query: 'anything' })
      .expect(200);
    expect(res.body).toEqual([
      { label: 'Survey 1', value: 'id1' },
      { label: 'Survey 2', value: 'id2' }
    ]);
  });

  it('POST /grafana/search returns 404 for missing survey', async () => {
    mockDb.collection('surveys').findOne.mockResolvedValue(null);
    const res = await request(app)
      .post('/grafana/search')
      .send({ query: { surveyId: 'notfound' } })
      .expect(404);
    expect(res.body).toEqual({ error: 'Survey not found' });
  });

  it('POST /grafana/search returns questions for found survey', async () => {
    const fakeSurvey = { _id: 'id', json: { questions: [{ name: 'q1', text: 'Q1?' }] } };
    mockDb.collection('surveys').findOne.mockResolvedValue(fakeSurvey);
    // Mock SurveyModel.getAllQuestions
    const origSurveyModel = require('survey-core').SurveyModel;
    jest.spyOn(origSurveyModel.prototype, 'getAllQuestions').mockReturnValue([{ name: 'q1', text: 'Q1?' }]);
    const res = await request(app)
      .post('/grafana/search')
      .send({ query: { surveyId: 'id' } })
      .expect(200);
    expect(res.body).toEqual([{ label: 'Q1?', value: 'q1' }]);
  });

  it('POST /grafana/query returns total count for surveyId only', async () => {
    mockDb.collection('responses').countDocuments.mockResolvedValue(42);
    const res = await request(app)
      .post('/grafana/query')
      .send({ targets: [{ surveyId: 'id' }], range: { from: new Date().toISOString(), to: new Date().toISOString() } })
      .expect(200);
    expect(res.body[0]).toEqual({ type: 'total', count: 42 });
  });

  it('POST /grafana/query returns stats for surveyId and questionId', async () => {
    mockSurveyAnalytics.getQuestionStats.mockResolvedValue({ type: 'number', count: 1 });
    const res = await request(app)
      .post('/grafana/query')
      .send({ targets: [{ surveyId: 'id', questionId: 'q1' }], range: { from: new Date().toISOString(), to: new Date().toISOString() } })
      .expect(200);
    expect(res.body[0]).toEqual({ type: 'number', count: 1 });
  });

  it('POST /grafana/query returns canned response for response_count', async () => {
    const res = await request(app)
      .post('/grafana/query')
      .send({ targets: [{ target: 'response_count' }], range: { from: new Date().toISOString(), to: new Date().toISOString() } })
      .expect(200);
    expect(res.body[0]).toHaveProperty('target', 'response_count');
    expect(Array.isArray(res.body[0].datapoints)).toBe(true);
  });

  it('POST /grafana/query returns canned table data', async () => {
    const res = await request(app)
      .post('/grafana/query')
      .send({ targets: [{ target: 'table_data' }], range: { from: new Date().toISOString(), to: new Date().toISOString() } })
      .expect(200);
    expect(res.body[0]).toHaveProperty('type', 'table');
    expect(Array.isArray(res.body[0].rows)).toBe(true);
  });

  it('POST /grafana/query handles errors', async () => {
    mockSurveyAnalytics.getQuestionStats.mockRejectedValue(new Error('fail'));
    const res = await request(app)
      .post('/grafana/query')
      .send({ targets: [{ surveyId: 'id', questionId: 'q1' }], range: { from: new Date().toISOString(), to: new Date().toISOString() } })
      .expect(500);
    expect(res.body).toEqual({ error: 'fail' });
  });

  it('GET /grafana/annotations returns annotation data', async () => {
    const now = Date.now();
    const mockToArray = jest.fn().mockResolvedValue([
      { createdAt: new Date(now), userId: 'u1' },
      { createdAt: new Date(now + 1000), userId: 'u2' }
    ]);
    mockDb.collection('responses').find.mockReturnValue({ toArray: mockToArray });
    const res = await request(app)
      .get(`/grafana/annotations?from=${now}&to=${now + 2000}`)
      .expect(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('time');
    expect(res.body[0]).toHaveProperty('text');
    expect(res.body[0]).toHaveProperty('tags');
  });

  it('GET /grafana/annotations handles errors', async () => {
    mockDb.collection('responses').find.mockImplementation(() => { throw new Error('fail'); });
    const now = Date.now();
    const res = await request(app)
      .get(`/grafana/annotations?from=${now}&to=${now + 2000}`)
      .expect(500);
    expect(res.body).toEqual({ error: 'fail' });
  });
}); 