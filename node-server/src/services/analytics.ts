import { Db } from 'mongodb';
import { SurveyModel } from 'survey-core';

/**
 * Base class for survey analytics providing common functionality
 * Handles caching, question type detection, and NLP integration
 */
export class SurveyAnalytics {
    /**
     * Creates a new SurveyAnalytics instance
     * @param db - MongoDB database instance
     * @param redisClient - Redis client for caching
     */
    constructor(protected db: Db, private redisClient: any) {}

    /**
     * Retrieves comprehensive statistics for a specific survey question
     * @param surveyId - Unique identifier for the survey
     * @param questionId - Unique identifier for the question
     * @param additional - Additional parameters (e.g., year for date questions)
     * @returns Promise resolving to question statistics object
     * @throws Error if survey or question not found
     */
    async getQuestionStats(surveyId: string, questionId: string, additional: any): Promise<any> {
        const cacheKey = `stats:${surveyId}:${questionId}:${additional || ''}`;
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
                additional = parseInt(additional);
                if(typeof additional === 'number') {
                    stats = await this.calculateMonthlyStats(surveyId, questionId, additional);
                }
                else {
                    stats = await this.calculateDateStats(surveyId, questionId);
                }
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

    /**
     * Calculates statistics for numeric questions
     * @param surveyId - Survey identifier
     * @param questionId - Question identifier
     * @returns Promise resolving to numeric statistics object
     */
    protected async calculateNumberStats(surveyId: string, questionId: string): Promise<{ type: string; count: number; average: number; min: number; max: number; median: number; mode: any[] | null; percentile25: number | null; percentile75: number | null; values: any; }> {
        throw new Error('Method not implemented.');
    }

    /**
     * Calculates statistics for date questions
     * @param surveyId - Survey identifier
     * @param questionId - Question identifier
     * @returns Promise resolving to date statistics object
     */
    protected async calculateDateStats(surveyId: string, questionId: string): Promise<{ type: string; count: any; average: string | null; min: string | null; max: string | null; median: string | null; mode: any[] | null; percentile25: string | null; percentile75: string | null; values: any; }> {
        throw new Error('Method not implemented.');
    }

    /**
     * Calculates statistics for choice questions (single or multiple)
     * @param surveyId - Survey identifier
     * @param questionId - Question identifier
     * @param isMultiple - Whether the question allows multiple selections
     * @returns Promise resolving to choice statistics object
     */
    protected async calculateChoiceStats(surveyId: string, questionId: string, isMultiple: boolean): Promise<{ type: string; count: number; totalSelections?: number; choices: Record<string, number>; mostSelected: Array<{ choice: any; count: any; }>; }> {
        throw new Error('Method not implemented.');
    }

    /**
     * Calculates statistics for rating questions
     * @param surveyId - Survey identifier
     * @param questionId - Question identifier
     * @returns Promise resolving to rating statistics object
     */
    protected async calculateRatingStats(surveyId: string, questionId: string): Promise<{ type: string; count: any; average: any; min: any; max: any; median: any; mode: any[] | null; distribution: Record<number, number>; values: any; }> {
        throw new Error('Method not implemented.');
    }

    /**
     * Calculates statistics for ranking questions
     * @param surveyId - Survey identifier
     * @param questionId - Question identifier
     * @returns Promise resolving to ranking statistics object
     */
    protected async calculateRankingStats(surveyId: string, questionId: string): Promise<{ type: string; count: number; averageRankings: Record<string, number>; mostPreferred: Array<{ item: string; rank: number; }>; leastPreferred: Array<any>; values: Array<Array<any>>; }> {
        throw new Error('Method not implemented.');
    }

    /**
     * Calculates statistics for text questions including NLP analysis
     * @param surveyId - Survey identifier
     * @param questionId - Question identifier
     * @returns Promise resolving to text statistics object with sentiment analysis
     */
    protected async calculateTextStats(surveyId: string, questionId: string): Promise<{ type: string; count: number; averageLength: number; minLength: number; maxLength: number; medianLength: number; sentimentAnalysis: { average: number; positive: number; negative: number; neutral: number; } | null; commonWords: Array<any>; values: Array<string>; }> {
        throw new Error('Method not implemented.');
    }

    /**
     * Calculates monthly statistics for date questions within a specific year
     * @param surveyId - Survey identifier
     * @param questionId - Question identifier
     * @param year - Year to analyze
     * @returns Promise resolving to monthly statistics object
     */
    protected async calculateMonthlyStats(surveyId: string, questionId: string, year: number): Promise<{ type: string; count: any; values: any }> {
        throw new Error('Method not implemented.');
    }

    /**
     * Invalidates cached statistics for all questions in a survey
     * @param surveyId - Survey identifier to clear cache for
     */
    async updateStatsCache(surveyId: string) {
        const survey = await this.db.collection<{_id: string, [index: string]: any}>('surveys').findOne({ _id: surveyId });
        if (!survey) return;

        const surveyModel = new SurveyModel(survey.json);
        for (const question of surveyModel.getAllQuestions() || []) {
            const cacheKey = `stats:${surveyId}:${question.name || question.id}`;
            await this.redisClient.del(cacheKey);
        }
    }

    /**
     * Processes text responses through NLP service for sentiment analysis
     * Only processes text responses longer than 15 characters
     * @param response - Survey response object containing answers
     */
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