import { Db } from 'mongodb';
import { calculateMedian, calculateMode, calculatePercentile, calculateRankingStats } from './utils';

export class SurveyAnalytics {
    constructor(private db: Db, private redisClient: any) {}

    async getQuestionStats(surveyId: string, questionId: string): Promise<any> {
        const cacheKey = `stats:${surveyId}:${questionId}`;
        const cached = await this.redisClient.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const survey = await this.db.collection<{_id: string, [index: string]: any}>('surveys').findOne({ _id: surveyId });
        if (!survey) throw new Error('Survey not found');
        
        const question = survey.questions.find((q: any) => q.id === questionId);
        if (!question) throw new Error('Question not found');

        let stats;
        switch (question.type) {
            case 'number':
                stats = await this.calculateNumberStats(surveyId, questionId);
                break;
            // case 'date':
            //     stats = await this.calculateDateStats(surveyId, questionId);
            //     break;
            // case 'single_choice':
            //     stats = await this.calculateChoiceStats(surveyId, questionId, false);
            //     break;
            // case 'multiple_choice':
            //     stats = await this.calculateChoiceStats(surveyId, questionId, true);
            //     break;
            // case 'rating':
            //     stats = await this.calculateRatingStats(surveyId, questionId);
            //     break;
            // case 'ranking':
            //     stats = await this.calculateRankingStats(surveyId, questionId);
            //     break;
            // case 'text':
            //     stats = await this.calculateTextStats(surveyId, questionId);
                break;
            default:
                throw new Error('Unsupported question type');
        }

        await this.redisClient.setEx(cacheKey, 900, JSON.stringify(stats));
        return stats;
    }

    private async calculateNumberStats(surveyId: string, questionId: string) {
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

    async updateStatsCache(surveyId: string) {
        const survey = await this.db.collection<{_id: string, [index: string]: any}>('surveys').findOne({ _id: surveyId });
        if (!survey) return;

        for (const question of survey.questions) {
            const cacheKey = `stats:${surveyId}:${question.id}`;
            await this.redisClient.del(cacheKey);
        }
    }

    async processTextResponses(response: any) {
        const textQuestions = Object.entries(response.answers)
            .filter(([_, answer]) => typeof answer === 'string' && answer.length > 10);
        
        if (textQuestions.length === 0) return;

        try {
            const nlpServiceUrl = process.env.NLP_SERVICE_URL || 'http://nlp-service:5000';
            
            for (const [questionId, answer] of textQuestions) {
                const nlpResult = await fetch(`${nlpServiceUrl}/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: answer })
                }).then(res => res.json());

                await this.db.collection('responses').updateOne(
                    { _id: response._id },
                    { $set: { [`nlp.${questionId}`]: nlpResult } }
                );
            }
        } catch (error) {
            console.error('NLP processing error:', error);
        }
    }
}