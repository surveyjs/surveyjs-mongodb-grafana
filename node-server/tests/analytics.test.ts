import { SurveyAnalytics } from '../src/services/analytics';
import { Db } from 'mongodb';

// Mock MongoDB
const mockCollection = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    project: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn()
};

const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection)
} as unknown as Db;

// Mock Redis
const mockRedisClient = {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    ping: jest.fn()
};

// Mock fetch for NLP service
global.fetch = jest.fn();

describe('SurveyAnalytics', () => {
    let analytics: SurveyAnalytics;

    beforeEach(() => {
        jest.clearAllMocks();
        analytics = new SurveyAnalytics(mockDb, mockRedisClient);
    });

    describe('getQuestionStats', () => {
        it('should return cached stats if available', async () => {
            const cachedStats = { type: 'number', count: 5 };
            mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedStats));

            const result = await analytics.getQuestionStats('survey1', 'question1');

            expect(result).toEqual(cachedStats);
            expect(mockRedisClient.get).toHaveBeenCalledWith('stats:survey1:question1');
        });

        it('should throw error for unsupported question type', async () => {
            mockRedisClient.get.mockResolvedValue(null);
            mockCollection.findOne.mockResolvedValue({
                json: { elements: [{ id: 'question1', type: 'html' }] }
            });

            await expect(analytics.getQuestionStats('survey1', 'question1'))
                .rejects.toThrow('Unsupported question type');
        });
    });

    describe('calculateNumberStats', () => {
        it('should calculate number statistics correctly', async () => {
            const mockResponses = [
                { value: 5 },
                { value: 10 },
                { value: 5 },
                { value: 15 },
                { value: 5 }
            ];

            mockCollection.toArray.mockResolvedValue(mockResponses);

            const result = await (analytics as any).calculateNumberStats('survey1', 'question1');

            expect(result).toEqual({
                type: 'number',
                count: 5,
                average: 8,
                min: 5,
                max: 15,
                median: 5,
                mode: [5],
                percentile25: 5,
                percentile75: 10,
                values: [5, 10, 5, 15, 5]
            });
        });

        it('should handle empty responses', async () => {
            mockCollection.toArray.mockResolvedValue([]);

            const result = await (analytics as any).calculateNumberStats('survey1', 'question1');

            expect(result.count).toBe(0);
            expect(result.average).toBeNaN();
        });
    });

    describe('calculateDateStats', () => {
        it('should calculate date statistics correctly', async () => {
            const mockResponses = [
                { value: '2023-01-01T00:00:00.000Z' },
                { value: '2023-01-15T00:00:00.000Z' },
                { value: '2023-01-30T00:00:00.000Z' }
            ];

            mockCollection.toArray.mockResolvedValue(mockResponses);

            const result = await (analytics as any).calculateDateStats('survey1', 'question1');

            expect(result.type).toBe('date');
            expect(result.count).toBe(3);
            expect(result.min).toBe('2023-01-01T00:00:00.000Z');
            expect(result.max).toBe('2023-01-30T00:00:00.000Z');
            expect(result.values).toHaveLength(3);
        });

        it('should handle invalid dates', async () => {
            const mockResponses = [
                { value: 'invalid-date' },
                { value: '2023-01-01T00:00:00.000Z' }
            ];

            mockCollection.toArray.mockResolvedValue(mockResponses);

            const result = await (analytics as any).calculateDateStats('survey1', 'question1');

            expect(result.count).toBe(1);
            expect(result.values).toHaveLength(1);
        });

        it('should handle empty responses', async () => {
            mockCollection.toArray.mockResolvedValue([]);

            const result = await (analytics as any).calculateDateStats('survey1', 'question1');

            expect(result.count).toBe(0);
            expect(result.average).toBeNull();
        });
    });

    describe('calculateChoiceStats', () => {
        describe('single choice', () => {
            it('should calculate single choice statistics correctly', async () => {
                const mockResponses = [
                    { value: 'option1' },
                    { value: 'option2' },
                    { value: 'option1' },
                    { value: 'option3' }
                ];

                mockCollection.toArray.mockResolvedValue(mockResponses);

                const result = await (analytics as any).calculateChoiceStats('survey1', 'question1', false);

                expect(result.type).toBe('single_choice');
                expect(result.count).toBe(4);
                expect(result.choices).toEqual({
                    option1: 2,
                    option2: 1,
                    option3: 1
                });
                expect(result.mostSelected).toEqual([
                    { choice: 'option1', count: 2 },
                    { choice: 'option2', count: 1 },
                    { choice: 'option3', count: 1 }
                ]);
            });
        });

        describe('multiple choice', () => {
            it('should calculate multiple choice statistics correctly', async () => {
                const mockResponses = [
                    { value: ['option1', 'option2'] },
                    { value: ['option1'] },
                    { value: ['option2', 'option3'] }
                ];

                mockCollection.toArray.mockResolvedValue(mockResponses);

                const result = await (analytics as any).calculateChoiceStats('survey1', 'question1', true);

                expect(result.type).toBe('multiple_choice');
                expect(result.count).toBe(3);
                expect(result.totalSelections).toBe(5);
                expect(result.choices).toEqual({
                    option1: 2,
                    option2: 2,
                    option3: 1
                });
            });
        });
    });

    describe('calculateRatingStats', () => {
        it('should calculate rating statistics correctly', async () => {
            const mockResponses = [
                { value: 5 },
                { value: 7 },
                { value: 5 },
                { value: 8 },
                { value: 6 }
            ];

            mockCollection.toArray.mockResolvedValue(mockResponses);

            const result = await (analytics as any).calculateRatingStats('survey1', 'question1');

            expect(result.type).toBe('rating');
            expect(result.count).toBe(5);
            expect(result.average).toBe(6.2);
            expect(result.min).toBe(5);
            expect(result.max).toBe(8);
            expect(result.median).toBe(6);
            expect(result.mode).toEqual([5]);
            expect(result.distribution).toEqual({
                5: 2,
                6: 1,
                7: 1,
                8: 1
            });
        });

        it('should filter out invalid ratings', async () => {
            const mockResponses = [
                { value: 5 },
                { value: 15 }, // Invalid (out of range)
                { value: 0 },  // Invalid (out of range)
                { value: 7 }
            ];

            mockCollection.toArray.mockResolvedValue(mockResponses);

            const result = await (analytics as any).calculateRatingStats('survey1', 'question1');

            expect(result.count).toBe(2);
            expect(result.values).toEqual([5, 7]);
        });

        it('should handle empty responses', async () => {
            mockCollection.toArray.mockResolvedValue([]);

            const result = await (analytics as any).calculateRatingStats('survey1', 'question1');

            expect(result.count).toBe(0);
            expect(result.average).toBeNull();
        });
    });

    describe('calculateRankingStats', () => {
        it('should calculate ranking statistics correctly', async () => {
            const mockResponses = [
                { value: ['item1', 'item2', 'item3'] },
                { value: ['item2', 'item1', 'item3'] },
                { value: ['item3', 'item1', 'item2'] },
                { value: ['item3', 'item1', 'item2'] }
            ];

            mockCollection.toArray.mockResolvedValue(mockResponses);

            const result = await (analytics as any).calculateRankingStats('survey1', 'question1');

            expect(result.type).toBe('ranking');
            expect(result.count).toBe(4);
            expect(result.averageRankings).toEqual({
                item1: 1.75,
                item2: 2.25,
                item3: 2
            });
            expect(result.mostPreferred).toHaveLength(3);
            expect(result.leastPreferred).toHaveLength(3);
        });

        it('should handle empty responses', async () => {
            mockCollection.toArray.mockResolvedValue([]);

            const result = await (analytics as any).calculateRankingStats('survey1', 'question1');

            expect(result.count).toBe(0);
            expect(result.averageRankings).toEqual({});
        });
    });

    describe('calculateTextStats', () => {
        it('should calculate text statistics correctly', async () => {
            const mockResponses = [
                { value: 'This is a test response', nlp: { sentiment: { polarity: 0.5 } } },
                { value: 'Another test response here', nlp: { sentiment: { polarity: -0.2 } } },
                { value: 'Short', nlp: null } // Too short, no NLP data
            ];

            mockCollection.toArray.mockResolvedValue(mockResponses);

            const result = await (analytics as any).calculateTextStats('survey1', 'question1');

            expect(result.type).toBe('text');
            expect(result.count).toBe(3);
            expect(result.averageLength).toBe(18);
            expect(result.minLength).toBe(5);
            expect(result.maxLength).toBe(26);
            expect(result.sentimentAnalysis).toEqual({
                average: 0.15,
                positive: 1,
                negative: 1,
                neutral: 0
            });
            expect(result.commonWords).toHaveLength(6); // test, response, this, is, a, another, here
        });

        it('should handle responses without NLP data', async () => {
            const mockResponses = [
                { value: 'This is a test response', nlp: null },
                { value: 'Another test response', nlp: null }
            ];

            mockCollection.toArray.mockResolvedValue(mockResponses);

            const result = await (analytics as any).calculateTextStats('survey1', 'question1');

            expect(result.sentimentAnalysis).toBeNull();
            expect(result.commonWords.length).toBeGreaterThan(0);
        });

        it('should handle empty responses', async () => {
            mockCollection.toArray.mockResolvedValue([]);

            const result = await (analytics as any).calculateTextStats('survey1', 'question1');

            expect(result.count).toBe(0);
            expect(result.averageLength).toBe(0);
        });
    });

    describe('updateStatsCache', () => {
        it('should clear cache for all questions in survey', async () => {
            const mockSurvey = {
                json: {
                    elements: [
                        { name: 'q1', type: 'text', inputType: 'number' },
                        { name: 'q2', type: 'text', inputType: 'number' },
                        { name: 'q3', type: 'text', inputType: 'number' }
                    ]
                }
            };

            mockCollection.findOne.mockResolvedValue(mockSurvey);

            await analytics.updateStatsCache('survey1');

            expect(mockRedisClient.del).toHaveBeenCalledTimes(3);
            expect(mockRedisClient.del).toHaveBeenCalledWith('stats:survey1:q1');
            expect(mockRedisClient.del).toHaveBeenCalledWith('stats:survey1:q2');
            expect(mockRedisClient.del).toHaveBeenCalledWith('stats:survey1:q3');
        });

        it('should handle survey not found', async () => {
            mockCollection.findOne.mockResolvedValue(null);

            await analytics.updateStatsCache('nonexistent');

            expect(mockRedisClient.del).not.toHaveBeenCalled();
        });
    });

    describe('processTextResponses', () => {
        it('should process text responses with NLP service', async () => {
            const mockResponse = {
                _id: 'response1',
                answers: {
                    q1: 'Short answer',
                    q2: 'This is a longer text response that should be processed',
                    q3: 5 // Not text
                }
            };

            const mockNlpResult = { sentiment: 0.3, keywords: ['text', 'response'] };
            (global.fetch as jest.Mock).mockResolvedValue({
                json: jest.fn().mockResolvedValue(mockNlpResult)
            });

            await analytics.processTextResponses(mockResponse);

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://nlp-service:5000/analyze',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: 'This is a longer text response that should be processed' })
                })
            );
            expect(mockCollection.updateOne).toHaveBeenCalledWith(
                { _id: 'response1' },
                { $set: { 'nlp.q2': mockNlpResult } }
            );
        });

        it('should handle NLP service errors gracefully', async () => {
            const mockResponse = {
                _id: 'response1',
                answers: {
                    q1: 'This is a long text response'
                }
            };

            (global.fetch as jest.Mock).mockRejectedValue(new Error('NLP service unavailable'));

            await analytics.processTextResponses(mockResponse);

            expect(mockCollection.updateOne).not.toHaveBeenCalled();
        });

        it('should skip short text responses', async () => {
            const mockResponse = {
                _id: 'response1',
                answers: {
                    q1: 'Short',
                    q2: 5
                }
            };

            await analytics.processTextResponses(mockResponse);

            expect(global.fetch).not.toHaveBeenCalled();
            expect(mockCollection.updateOne).not.toHaveBeenCalled();
        });
    });
}); 