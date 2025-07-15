import { SurveyAnalytics } from '../src/services/analytics';

// Mock data
const mockSurvey = {
  _id: "burger_survey_2023",
  title: "Burger Satisfaction Survey",
  description: "Survey to measure customer satisfaction with our burgers",
  createdAt: new Date(),
  questions: [
    {
      id: "q1",
      text: "How many burgers do you consume per month?",
      type: "number",
      min: 0,
      max: 100
    }
  ]
};

describe('SurveyAnalytics', () => {
  let analytics: SurveyAnalytics;
  let mockDb: any;
  let mockRedisClient: any;

  beforeEach(() => {
    // Mock Redis client
    mockRedisClient = {
      get: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn()
    };

    // Mock MongoDB database
    const mockCollection = {
      findOne: jest.fn(),
      find: jest.fn().mockReturnValue({
        project: jest.fn().mockReturnValue({
          toArray: jest.fn()
        })
      }),
      updateOne: jest.fn()
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };

    analytics = new SurveyAnalytics(mockDb, mockRedisClient);
  });

  describe('getQuestionStats', () => {
    it('should return cached stats when available', async () => {
      const cachedStats = { type: 'number', count: 5, average: 6.6 };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedStats));

      const result = await analytics.getQuestionStats('burger_survey_2023', 'q1');

      expect(result).toEqual(cachedStats);
      expect(mockRedisClient.get).toHaveBeenCalledWith('stats:burger_survey_2023:q1');
    });

    it('should throw error when survey not found', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockDb.collection('surveys').findOne.mockResolvedValue(null);

      await expect(analytics.getQuestionStats('nonexistent', 'q1'))
        .rejects.toThrow('Survey not found');
    });

    it('should throw error when question not found', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockDb.collection('surveys').findOne.mockResolvedValue(mockSurvey);

      await expect(analytics.getQuestionStats('burger_survey_2023', 'nonexistent'))
        .rejects.toThrow('Question not found');
    });

    it('should calculate number stats correctly', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockDb.collection('surveys').findOne.mockResolvedValue(mockSurvey);
      
      const mockResponsesData = [
        { value: 4 },
        { value: 8 },
        { value: 12 }
      ];
      mockDb.collection('responses').find().project().toArray.mockResolvedValue(mockResponsesData);

      const result = await analytics.getQuestionStats('burger_survey_2023', 'q1');

      expect(result).toEqual({
        type: 'number',
        count: 3,
        average: 8, // (8+4+12)/3
        min: 4,
        max: 12,
        median: 8,
        mode: [4, 8, 12], // All values appear once
        percentile25: 6,
        percentile75: 10,
        values: [4, 8, 12]
      });

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'stats:burger_survey_2023:q1',
        900,
        expect.any(String)
      );
    });

    it('should throw error for unsupported question type', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      const surveyWithUnsupportedType = {
        ...mockSurvey,
        questions: [{ id: 'q1', type: 'unsupported_type' }]
      };
      mockDb.collection('surveys').findOne.mockResolvedValue(surveyWithUnsupportedType);

      await expect(analytics.getQuestionStats('burger_survey_2023', 'q1'))
        .rejects.toThrow('Unsupported question type');
    });
  });

  describe('updateStatsCache', () => {
    it('should clear cache for all questions in survey', async () => {
      mockDb.collection('surveys').findOne.mockResolvedValue(mockSurvey);

      await analytics.updateStatsCache('burger_survey_2023');

      expect(mockRedisClient.del).toHaveBeenCalledTimes(1);
      expect(mockRedisClient.del).toHaveBeenCalledWith('stats:burger_survey_2023:q1');
    });

    it('should do nothing when survey not found', async () => {
      mockDb.collection('surveys').findOne.mockResolvedValue(null);

      await analytics.updateStatsCache('nonexistent');

      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });
  });

  describe('processTextResponses', () => {
    it('should process text responses with NLP service', async () => {
      const mockResponse = {
        _id: 'response123',
        answers: {
          q1: 5,
          q2: 'This is a long text response that should be processed',
          q3: 'Another long response for processing'
        }
      };

      // Mock fetch for NLP service
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({ sentiment: 'positive', keywords: ['good', 'great'] })
      });

      await analytics.processTextResponses(mockResponse);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockDb.collection('responses').updateOne).toHaveBeenCalledTimes(2);
    });

    it('should skip processing when no text responses', async () => {
      const mockResponse = {
        _id: 'response123',
        answers: {
          q1: 5,
          q2: 'short',
          q3: 4
        }
      };

      await analytics.processTextResponses(mockResponse);

      expect(mockDb.collection('responses').updateOne).not.toHaveBeenCalled();
    });

    it('should handle NLP service errors gracefully', async () => {
      const mockResponse = {
        _id: 'response123',
        answers: {
          q1: 'This is a long text response that should be processed'
        }
      };

      // Mock fetch to throw error
      global.fetch = jest.fn().mockRejectedValue(new Error('NLP service unavailable'));

      // Should not throw error
      await expect(analytics.processTextResponses(mockResponse)).resolves.not.toThrow();
    });
  });
}); 