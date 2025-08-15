import { Db } from 'mongodb';
import { SurveyModel } from 'survey-core';

export class SurveyAnalytics {
    constructor(protected db: Db, private redisClient: any) {}

    async getQuestionStats(surveyId: string, questionId: string): Promise<any> {
        const cacheKey = `stats:${surveyId}:${questionId}`;
        const cached = await this.redisClient.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const survey = await this.db.collection<{_id: string, [index: string]: any}>('surveys').findOne({ _id: surveyId });
        if (!survey) throw new Error('Survey not found');
        
        const surveyModel = new SurveyModel(survey.json);
        const question = surveyModel.getQuestionByName(questionId);
        if (!question) throw new Error('Question not found');

        let questionType = question.getType();
        if(questionType === 'text') {
            if (question.inputType === 'date' || question.inputType === 'datetime-local') {
                questionType = 'date';
            }
            else if (question.inputType === 'number') {
                questionType = 'number';
            }
        }
        let stats;
        switch (questionType) {
            case 'number':
                stats = await this.calculateNumberStats(surveyId, questionId);
                break;
            case 'date':
                stats = await this.calculateDateStats(surveyId, questionId);
                break;
            case 'radiogroup':
            case 'dropdown':
                stats = await this.calculateChoiceStats(surveyId, questionId, false);
                break;
            case 'checkbox':
            case 'tagbox':
                stats = await this.calculateChoiceStats(surveyId, questionId, true);
                break;
            case 'rating':
                stats = await this.calculateRatingStats(surveyId, questionId);
                break;
            case 'ranking':
                stats = await this.calculateRankingStats(surveyId, questionId);
                break;
            case 'text':
            case 'comment':
                stats = await this.calculateTextStats(surveyId, questionId);
                break;
            default:
                throw new Error('Unsupported question type');
        }

        await this.redisClient.setEx(cacheKey, 900, JSON.stringify(stats));
        return stats;
    }

    protected async calculateNumberStats(surveyId: string, questionId: string): Promise<{ type: string; count: number; average: number; min: number; max: number; median: number; mode: any[] | null; percentile25: number | null; percentile75: number | null; values: any; }> {
        throw new Error('Method not implemented.');
    }

    protected async calculateDateStats(surveyId: string, questionId: string): Promise<{ type: string; count: any; average: string | null; min: string | null; max: string | null; median: string | null; mode: any[] | null; percentile25: string | null; percentile75: string | null; values: any; }> {
        throw new Error('Method not implemented.');
    }

    protected async calculateChoiceStats(surveyId: string, questionId: string, isMultiple: boolean): Promise<{ type: string; count: number; totalSelections?: number; choices: Record<string, number>; mostSelected: Array<{ choice: any; count: any; }>; }> {
        throw new Error('Method not implemented.');
    }

    protected async calculateRatingStats(surveyId: string, questionId: string): Promise<{ type: string; count: any; average: any; min: any; max: any; median: any; mode: any[] | null; distribution: Record<number, number>; values: any; }> {
        throw new Error('Method not implemented.');
    }

    protected async calculateRankingStats(surveyId: string, questionId: string): Promise<{ type: string; count: number; averageRankings: Record<string, number>; mostPreferred: Array<{ item: string; rank: number; }>; leastPreferred: Array<any>; values: Array<Array<any>>; }> {
        throw new Error('Method not implemented.');
    }

    protected async calculateTextStats(surveyId: string, questionId: string): Promise<{ type: string; count: number; averageLength: number; minLength: number; maxLength: number; medianLength: number; sentimentAnalysis: { average: number; positive: number; negative: number; neutral: number; } | null; commonWords: Array<any>; values: Array<string>; }> {
        throw new Error('Method not implemented.');
    }

    async updateStatsCache(surveyId: string) {
        const survey = await this.db.collection<{_id: string, [index: string]: any}>('surveys').findOne({ _id: surveyId });
        if (!survey) return;

        const surveyModel = new SurveyModel(survey.json);
        for (const question of surveyModel.getAllQuestions() || []) {
            const cacheKey = `stats:${surveyId}:${question.name || question.id}`;
            await this.redisClient.del(cacheKey);
        }
    }

    async processTextResponses(response: any) {
        const textQuestions = Object.entries(response.answers)
            .filter(([_, answer]) => typeof answer === 'string' && answer.length > 15);
        
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