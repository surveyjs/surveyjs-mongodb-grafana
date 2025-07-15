import { calculateMedian, calculateMode, calculatePercentile, calculateRankingStats } from '../src/services/utils';

describe('Utility Functions', () => {
  describe('calculateMedian', () => {
    it('should return 0 for empty array', () => {
      expect(calculateMedian([])).toBe(0);
    });

    it('should calculate median for odd number of values', () => {
      expect(calculateMedian([1, 3, 5, 7, 9])).toBe(5);
      expect(calculateMedian([2, 4, 6])).toBe(4);
    });

    it('should calculate median for even number of values', () => {
      expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
      expect(calculateMedian([1, 3, 5, 7, 9, 11])).toBe(6);
    });

    it('should handle single value', () => {
      expect(calculateMedian([5])).toBe(5);
    });

    it('should handle negative values', () => {
      expect(calculateMedian([-3, -1, 0, 2, 4])).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(calculateMedian([1.5, 2.5, 3.5])).toBe(2.5);
    });
  });

  describe('calculateMode', () => {
    it('should return empty array for empty input', () => {
      expect(calculateMode([])).toEqual([]);
    });

    it('should return all values when all appear once', () => {
      expect(calculateMode([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return single mode when one value appears most frequently', () => {
      expect(calculateMode([1, 2, 2, 3, 4])).toEqual([2]);
      expect(calculateMode([1, 1, 1, 2, 3])).toEqual([1]);
    });

    it('should return multiple modes when multiple values appear equally frequently', () => {
      expect(calculateMode([1, 1, 2, 2, 3])).toEqual([1, 2]);
      expect(calculateMode([1, 2, 2, 3, 3, 4])).toEqual([2, 3]);
    });

    it('should handle single value', () => {
      expect(calculateMode([5])).toEqual([5]);
    });

    it('should handle negative values', () => {
      expect(calculateMode([-1, -1, 0, 1, 1])).toEqual([-1, 1]);
    });

    it('should handle decimal values', () => {
      expect(calculateMode([1.5, 1.5, 2.5, 3.5])).toEqual([1.5]);
    });
  });

  describe('calculatePercentile', () => {
    it('should return 0 for empty array', () => {
      expect(calculatePercentile([], 25)).toBe(0);
      expect(calculatePercentile([], 50)).toBe(0);
      expect(calculatePercentile([], 75)).toBe(0);
    });

    it('should calculate 25th percentile correctly', () => {
      expect(calculatePercentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 25)).toBe(3.5);
      expect(calculatePercentile([1, 2, 3, 4], 25)).toBe(1.5);
    });

    it('should calculate 50th percentile (median) correctly', () => {
      expect(calculatePercentile([1, 2, 3, 4, 5], 50)).toBe(3);
      expect(calculatePercentile([1, 2, 3, 4], 50)).toBe(2.5);
    });

    it('should calculate 75th percentile correctly', () => {
      expect(calculatePercentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 75)).toBe(7.5);
      expect(calculatePercentile([1, 2, 3, 4], 75)).toBe(3.5);
    });

    it('should handle single value', () => {
      expect(calculatePercentile([5], 25)).toBe(5);
      expect(calculatePercentile([5], 50)).toBe(5);
      expect(calculatePercentile([5], 75)).toBe(5);
    });

    it('should handle edge cases', () => {
      expect(calculatePercentile([1, 2, 3, 4, 5], 0)).toBe(1);
      expect(calculatePercentile([1, 2, 3, 4, 5], 100)).toBe(5);
    });

    it('should handle negative values', () => {
      expect(calculatePercentile([-5, -3, -1, 1, 3], 50)).toBe(-1);
    });
  });

  describe('calculateRankingStats', () => {
    it('should calculate average rankings correctly', () => {
      const rankings = [
        { "Taste": 1, "Price": 3, "Portion Size": 2, "Freshness": 4, "Presentation": 5 },
        { "Price": 1, "Freshness": 2, "Taste": 3, "Portion Size": 4, "Presentation": 5 },
        { "Freshness": 1, "Taste": 2, "Portion Size": 3, "Price": 4, "Presentation": 5 }
      ];

      const result = calculateRankingStats(rankings);

      expect(result).toEqual({
        "Taste": 2,
        "Price": 2.6666666666666665,
        "Portion Size": 3,
        "Freshness": 2.3333333333333335,
        "Presentation": 5
      });
    });

    it('should handle empty array', () => {
      expect(calculateRankingStats([])).toEqual({});
    });

    it('should handle single ranking', () => {
      const rankings = [{ "A": 1, "B": 2, "C": 3 }];
      expect(calculateRankingStats(rankings)).toEqual({
        "A": 1,
        "B": 2,
        "C": 3
      });
    });

    it('should handle rankings with different keys', () => {
      const rankings = [
        { "A": 1, "B": 2, "C": 0 },
        { "A": 0, "B": 1, "C": 2 },
        { "A": 2, "B": 0, "C": 1 }
      ];

      const result = calculateRankingStats(rankings);

      expect(result).toEqual({
        "A": 1,
        "B": 1,
        "C": 1
      });
    });

    it('should handle decimal rankings', () => {
      const rankings = [
        { "A": 1.5, "B": 2.5 },
        { "A": 2.5, "B": 1.5 }
      ];

      const result = calculateRankingStats(rankings);

      expect(result).toEqual({
        "A": 2,
        "B": 2
      });
    });
  });
}); 