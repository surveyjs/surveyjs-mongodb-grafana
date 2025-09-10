/**
 * Calculates the median value from an array of numbers
 * @param values - Array of numbers to calculate median from
 * @returns Median value, or 0 if array is empty
 */
export const calculateMedian = (values: number[]): number => {
    if (values.length === 0) return 0;

    const sortedValues = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sortedValues.length / 2);

    if (sortedValues.length % 2 !== 0) {
        return sortedValues[middle];
    }
    
    return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
};

/**
 * Calculates the mode(s) from an array of numbers
 * @param values - Array of numbers to calculate mode from
 * @returns Array of mode values (can be multiple if tied)
 */
export const calculateMode = (values: number[]): number[] => {
    if (values.length === 0) return [];

    const frequencyMap = new Map<number, number>();
    let maxFrequency = 0;

    for (const value of values) {
        const count = (frequencyMap.get(value) || 0) + 1;
        frequencyMap.set(value, count);
        if (count > maxFrequency) maxFrequency = count;
    }

    const modes: number[] = [];
    for (const [value, frequency] of frequencyMap) {
        if (frequency === maxFrequency) {
            modes.push(value);
        }
    }

    return modes;
};

/**
 * Calculates the specified percentile from an array of numbers
 * @param values - Array of numbers to calculate percentile from
 * @param percentile - Percentile value (0-100)
 * @returns Percentile value, or 0 if array is empty
 */
export const calculatePercentile = (values: number[], percentile: number): number => {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    
    if (Number.isInteger(index)) {
        return sorted[index];
    }
    
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    return (sorted[lower] + sorted[upper]) / 2;
};

/**
 * Calculates average ranking statistics from multiple ranking objects
 * @param rankings - Array of ranking objects where keys are items and values are ranks
 * @returns Object with average rankings for each item
 */
export const calculateRankingStats = (rankings: { [key: string]: number }[]): { [key: string]: number } => {
    const result: { [key: string]: { sum: number, count: number } } = {};
    
    for (const ranking of rankings) {
        for (const [key, value] of Object.entries(ranking)) {
            if (!result[key]) {
                result[key] = { sum: 0, count: 0 };
            }
            result[key].sum += value;
            result[key].count++;
        }
    }
    
    const averages: { [key: string]: number } = {};
    for (const [key, data] of Object.entries(result)) {
        averages[key] = data.sum / data.count;
    }
    
    return averages;
};