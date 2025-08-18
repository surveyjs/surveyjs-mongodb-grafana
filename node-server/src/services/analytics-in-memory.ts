import { Db } from 'mongodb';
import { calculateMedian, calculateMode, calculatePercentile, calculateRankingStats } from './utils';
import { SurveyAnalytics } from './analytics';

export class SurveyAnalyticsInMemory extends SurveyAnalytics {
    constructor(db: Db, redisClient: any) {
        super(db, redisClient);
    }

    protected async calculateNumberStats(surveyId: string, questionId: string) {
        const responses = await this.db.collection('responses')
            .find({ surveyId })
            .project({ _id: 0, value: `$answers.${questionId}` })
            .toArray();
            
        const values = responses.map(r => r.value).filter(v => typeof v === 'number');
        
        return {
            type: 'number',
            count: values.length,
            average: values.reduce((sum, val) => sum + val, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            median: calculateMedian(values),
            mode: calculateMode(values),
            percentile25: calculatePercentile(values, 25),
            percentile75: calculatePercentile(values, 75),
            values
        };
    }

    protected async calculateDateStats(surveyId: string, questionId: string) {
        const responses = await this.db.collection('responses')
            .find({ surveyId })
            .project({ _id: 0, value: `$answers.${questionId}` })
            .toArray();
            
        const values = responses.map(r => r.value)
            .filter(v => v && !isNaN(new Date(v).getTime()))
            .map(v => new Date(v).getTime());
        
        if (values.length === 0) {
            return {
                type: 'date',
                count: 0,
                average: null,
                min: null,
                max: null,
                median: null,
                mode: null,
                percentile25: null,
                percentile75: null,
                values: []
            };
        }
        
        return {
            type: 'date',
            count: values.length,
            average: new Date(values.reduce((sum, val) => sum + val, 0) / values.length).toISOString(),
            min: new Date(Math.min(...values)).toISOString(),
            max: new Date(Math.max(...values)).toISOString(),
            median: new Date(calculateMedian(values)).toISOString(),
            mode: calculateMode(values).map(v => new Date(v).toISOString()),
            percentile25: new Date(calculatePercentile(values, 25)).toISOString(),
            percentile75: new Date(calculatePercentile(values, 75)).toISOString(),
            values: values.map(v => new Date(v).toISOString())
        };
    }

    protected async calculateChoiceStats(surveyId: string, questionId: string, isMultiple: boolean) {
        const responses = await this.db.collection('responses')
            .find({ surveyId })
            .project({ _id: 0, value: `$answers.${questionId}` })
            .toArray();
            
        const values = responses.map(r => r.value).filter(v => v !== undefined && v !== null);
        
        if (isMultiple) {
            // For multiple choice, flatten arrays
            const flattenedValues = values.flat();
            const choiceCounts = flattenedValues.reduce((acc: any, choice: string) => {
                acc[choice] = (acc[choice] || 0) + 1;
                return acc;
            }, {});
            
            return {
                type: 'multiple_choice',
                count: values.length,
                totalSelections: flattenedValues.length,
                choices: choiceCounts,
                mostSelected: Object.entries(choiceCounts)
                    .sort(([,a]: any, [,b]: any) => b - a)
                    .slice(0, 3)
                    .map(([choice, count]) => ({ choice, count }))
            };
        } else {
            // For single choice
            const choiceCounts = values.reduce((acc: any, choice: string) => {
                acc[choice] = (acc[choice] || 0) + 1;
                return acc;
            }, {});
            
            return {
                type: 'single_choice',
                count: values.length,
                choices: choiceCounts,
                mostSelected: Object.entries(choiceCounts)
                    .sort(([,a]: any, [,b]: any) => b - a)
                    .slice(0, 3)
                    .map(([choice, count]) => ({ choice, count }))
            };
        }
    }

    protected async calculateRatingStats(surveyId: string, questionId: string) {
        const responses = await this.db.collection('responses')
            .find({ surveyId })
            .project({ _id: 0, value: `$answers.${questionId}` })
            .toArray();
            
        const values = responses.map(r => r.value).filter(v => typeof v === 'number');
        
        if (values.length === 0) {
            return {
                type: 'rating',
                count: 0,
                average: null,
                min: null,
                max: null,
                median: null,
                mode: null,
                distribution: {},
                values: []
            };
        }
        
        const distribution = values.reduce((acc: any, rating: number) => {
            acc[rating] = (acc[rating] || 0) + 1;
            return acc;
        }, {});
        
        return {
            type: 'rating',
            count: values.length,
            average: values.reduce((sum, val) => sum + val, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            median: calculateMedian(values),
            mode: calculateMode(values),
            distribution,
            values
        };
    }

    protected async calculateRankingStats(surveyId: string, questionId: string) {
        const responses = await this.db.collection('responses')
            .find({ surveyId })
            .project({ _id: 0, value: `$answers.${questionId}` })
            .toArray();
            
        const values = responses.map(r => r.value).filter(v => Array.isArray(v));
        
        if (values.length === 0) {
            return {
                type: 'ranking',
                count: 0,
                averageRankings: {},
                mostPreferred: [],
                leastPreferred: [],
                values: []
            };
        }
        
        // Convert array format to object format for calculateRankingStats
        const rankingObjects = values.map((rankingArray: any[]) => {
            const obj: { [key: string]: number } = {};
            rankingArray.forEach((item, index) => {
                obj[item] = index + 1; // Convert to 1-based ranking
            });
            return obj;
        });
        
        const averageRankings = calculateRankingStats(rankingObjects);
        
        // Calculate most and least preferred items
        const sortedItems = Object.entries(averageRankings)
            .sort(([,a], [,b]) => a - b);
        
        const mostPreferred = sortedItems.slice(0, 3).map(([item, rank]) => ({ item, rank }));
        const leastPreferred = sortedItems.slice(-3).reverse().map(([item, rank]) => ({ item, rank }));
        
        return {
            type: 'ranking',
            count: values.length,
            averageRankings,
            mostPreferred,
            leastPreferred,
            values: values.slice(0, 10) // Limit to first 10 responses
        };
    }

    protected async calculateTextStats(surveyId: string, questionId: string) {
        const responses = await this.db.collection('responses')
            .find({ surveyId })
            .project({ _id: 0, value: `$answers.${questionId}`, nlp: `$nlp.${questionId}` })
            .toArray();
            
        const values = responses.map(r => r.value).filter(v => typeof v === 'string');
        
        if (values.length === 0) {
            return {
                type: 'text',
                count: 0,
                averageLength: 0,
                minLength: 0,
                maxLength: 0,
                medianLength: 0,
                sentimentAnalysis: null,
                commonWords: [],
                values: []
            };
        }
        
        const lengths = values.map(v => v.length);
        const nlpData = responses.map(r => r.nlp).filter(nlp => nlp);
        
        // Calculate sentiment if NLP data is available
        let sentimentAnalysis = null;
        if (nlpData.length > 0) {
            const sentiments = nlpData.map(nlp => nlp.sentiment || { polarity: 0 });
            sentimentAnalysis = {
                average: sentiments.reduce((sum, s) => sum + s.polarity, 0) / sentiments.length,
                positive: sentiments.filter(s => s.polarity > 0.1).length,
                negative: sentiments.filter(s => s.polarity < -0.1).length,
                neutral: sentiments.filter(s => s.polarity >= -0.1 && s.polarity <= 0.1).length
            };
        }
        
        // Calculate common words (simple implementation)
        const allWords = values.flatMap(text => 
            text.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 2)
        );
        
        const wordCounts = allWords.reduce((acc: any, word: string) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {});
        
        const commonWords = Object.entries(wordCounts)
            .sort(([,a]: any, [,b]: any) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
        
        return {
            type: 'text',
            count: values.length,
            averageLength: lengths.reduce((sum, val) => sum + val, 0) / lengths.length,
            minLength: Math.min(...lengths),
            maxLength: Math.max(...lengths),
            medianLength: calculateMedian(lengths),
            sentimentAnalysis,
            commonWords,
            values: values.slice(0, 10) // Limit to first 10 responses to avoid large payloads
        };
    }
}
