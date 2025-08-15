import { SurveyAnalyticsMongo } from '../src/services/analytics-mongo';
import { Db } from 'mongodb';

describe('SurveyAnalyticsMongo', () => {
  let db: any;
  let redis: any;
  let analytics: SurveyAnalyticsMongo;

  beforeEach(() => {
    redis = {
      get: jest.fn().mockResolvedValue(null),
      setEx: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined)
    };
    db = {
      collection: jest.fn()
    };
    analytics = new SurveyAnalyticsMongo(db as unknown as Db, redis);
  });

  it('calculates number stats', async () => {
    db.collection.mockReturnValue({
      aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { count: 4, average: 2.5, min: 1, max: 4, values: [1, 2, 3, 4] }
        ])
      })
    });
    const stats = await (analytics as any).calculateNumberStats('s1', 'q1');
    expect(stats).toMatchObject({
      type: 'number',
      count: 4,
      average: 2.5,
      min: 1,
      max: 4,
      median: 2.5,
      mode: [4],
      percentile25: 1.5,
      percentile75: 2.5
    });
  });

  it('calculates date stats', async () => {
    const now = new Date();
    const values = [now, new Date(now.getTime() + 1000)];
    db.collection.mockReturnValue({
      aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          {
            count: 2,
            min: values[0],
            max: values[1],
            average: now.getTime(),
            values: values
          }
        ])
      })
    });
    const stats = await (analytics as any).calculateDateStats('s1', 'q1');
    expect(stats.type).toBe('date');
    expect(stats.count).toBe(2);
    expect(stats.values.length).toBe(2);
  });

  it('calculates single choice stats', async () => {
    db.collection.mockReturnValue({
      aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { _id: 'A', count: 2 }, { _id: 'B', count: 1 }
        ])
      })
    });
    const stats = await (analytics as any).calculateChoiceStats('s1', 'q1', false);
    expect(stats.type).toBe('single_choice');
    expect(stats.choices).toEqual({ A: 2, B: 1 });
  });

  it('calculates multiple choice stats', async () => {
    db.collection.mockReturnValue({
      aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { _id: 'A', count: 2 }, { _id: 'B', count: 2 }, { _id: 'C', count: 1 }
        ])
      }),
      countDocuments: jest.fn().mockResolvedValue(3)
    });
    const stats = await (analytics as any).calculateChoiceStats('s1', 'q1', true);
    expect(stats.type).toBe('multiple_choice');
    expect(stats.choices).toEqual({ A: 2, B: 2, C: 1 });
    expect(stats.count).toBe(3);
    expect(stats.totalSelections).toBe(5);
  });

  it('calculates rating stats', async () => {
    db.collection.mockReturnValue({
      aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { count: 3, average: 7.33, min: 5, max: 10, values: [5, 7, 10], distribution: [5, 7, 10] }
        ])
      })
    });
    const stats = await (analytics as any).calculateRatingStats('s1', 'q1');
    expect(stats.type).toBe('rating');
    expect(stats.count).toBe(3);
    expect(stats.average).toBeCloseTo(7.33, 2);
    expect(stats.distribution).toEqual({ 5: 1, 7: 1, 10: 1 });
  });

  it('calculates ranking stats', async () => {
    db.collection.mockReturnValue({
      find: jest.fn().mockReturnValue({
        project: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { value: ['A', 'B', 'C'] }, { value: ['B', 'A', 'C'] }
          ])
        })
      })
    });
    const stats = await (analytics as any).calculateRankingStats('s1', 'q1');
    expect(stats.type).toBe('ranking');
    expect(stats.count).toBe(2);
    expect(stats.averageRankings).toBeDefined();
  });

  it('calculates text stats with sentiment and common words', async () => {
    db.collection.mockReturnValue({
      find: jest.fn().mockReturnValue({
        project: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { value: 'This is a good answer', nlp: { sentiment: { polarity: 0.5 } } },
            { value: 'Another good answer', nlp: { sentiment: { polarity: 0.2 } } }
          ])
        })
      })
    });
    const stats = await (analytics as any).calculateTextStats('s1', 'q1');
    expect(stats.type).toBe('text');
    expect(stats.count).toBe(2);
    expect(stats.sentimentAnalysis).toBeDefined();
    expect(stats.commonWords.length).toBeGreaterThan(0);
  });

  it('returns empty stats for empty responses', async () => {
    db.collection.mockReturnValue({
      aggregate: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
      countDocuments: jest.fn().mockResolvedValue(0),
      find: jest.fn().mockReturnValue({
        project: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) })
      })
    });
    expect((await (analytics as any).calculateNumberStats('s1', 'q1')).count).toBe(0);
    expect((await (analytics as any).calculateDateStats('s1', 'q1')).count).toBe(0);
    expect((await (analytics as any).calculateChoiceStats('s1', 'q1', false)).count).toBe(0);
    expect((await (analytics as any).calculateChoiceStats('s1', 'q1', true)).count).toBe(0);
    expect((await (analytics as any).calculateRatingStats('s1', 'q1')).count).toBe(0);
    expect((await (analytics as any).calculateRankingStats('s1', 'q1')).count).toBe(0);
    expect((await (analytics as any).calculateTextStats('s1', 'q1')).count).toBe(0);
  });
});
