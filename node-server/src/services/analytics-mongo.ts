import { Db, ObjectId } from 'mongodb';
import { SurveyAnalytics } from './analytics';
import { calculateMode, calculatePercentile } from './utils';

export class SurveyAnalyticsMongo extends SurveyAnalytics {
    constructor(db: Db, redisClient: any) {
        super(db, redisClient);
    }

    protected async calculateNumberStats(surveyId: string, questionId: string) {
        const pipeline = [
            { $match: { surveyId } },
            { $project: { value: `$answers.${questionId}` } },
            { $match: { value: { $type: 'number' } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    average: { $avg: "$value" },
                    min: { $min: "$value" },
                    max: { $max: "$value" },
                    values: { $push: "$value" }
                }
            }
        ];
        const result = await this.db.collection('responses').aggregate(pipeline).toArray();
        const doc = result[0] || { count: 0, average: null, min: null, max: null, values: [] };
        // Median, mode, percentiles must be calculated in memory
        const values = doc.values || [];
        values.sort((a: number, b: number) => a - b);
        const median = values.length ? (values.length % 2 === 0 ? (values[values.length/2-1] + values[values.length/2])/2 : values[Math.floor(values.length/2)]) : null;
        const mode = calculateMode(values);
        return {
            type: 'number',
            count: doc.count,
            average: doc.average,
            min: doc.min,
            max: doc.max,
            median,
            mode,
            percentile25: calculatePercentile(values, 25),
            percentile75: calculatePercentile(values, 75),
            values
        };
    }

    protected async calculateDateStats(surveyId: string, questionId: string) {
        const pipeline = [
            { $match: { surveyId } },
            { $project: { value: `$answers.${questionId}` } },
            { $match: { value: { $type: 'string' } } },
            {
                $addFields: {
                    dateValue: { $toDate: "$value" }
                }
            },
            { $match: { dateValue: { $ne: null } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    min: { $min: "$dateValue" },
                    max: { $max: "$dateValue" },
                    average: { $avg: { $toLong: "$dateValue" } },
                    values: { $push: "$dateValue" }
                }
            }
        ];
        const result = await this.db.collection('responses').aggregate(pipeline).toArray();
        const doc = result[0] || { count: 0, min: null, max: null, average: null, values: [] };
        const values = (doc.values || []).map((d: Date) => new Date(d).getTime()).sort((a: number, b: number) => a - b);
        const median = values.length ? (values.length % 2 === 0 ? (values[values.length/2-1] + values[values.length/2])/2 : values[Math.floor(values.length/2)]) : null;
        const p25 = calculatePercentile(values, 25);
        const p75 = calculatePercentile(values, 75);
        return {
            type: 'date',
            count: doc.count,
            average: doc.average ? new Date(doc.average).toISOString() : null,
            min: doc.min ? new Date(doc.min).toISOString() : null,
            max: doc.max ? new Date(doc.max).toISOString() : null,
            median: median !== null ? new Date(median).toISOString() : null,
            mode: null, // Not calculated efficiently in Mongo
            percentile25: p25 !== null ? new Date(p25).toISOString() : null,
            percentile75: p75 !== null ? new Date(p75).toISOString() : null,
            values: values.map((v: number) => new Date(v).toISOString())
        };
    }

    protected async calculateChoiceStats(surveyId: string, questionId: string, isMultiple: boolean) {
        if (isMultiple) {
            // Flatten arrays and count
            const pipeline = [
                { $match: { surveyId } },
                { $project: { value: `$answers.${questionId}` } },
                { $unwind: "$value" },
                { $group: { _id: "$value", count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ];
            const result = await this.db.collection('responses').aggregate(pipeline).toArray();
            const choices: Record<string, number> = {};
            result.forEach(r => { choices[r._id] = r.count; });
            return {
                type: 'multiple_choice',
                count: result.length,
                totalSelections: result.reduce((sum, r) => sum + r.count, 0),
                choices,
                mostSelected: result.slice(0, 3).map(r => ({ choice: r._id, count: r.count }))
            };
        } else {
            // Single choice
            const pipeline = [
                { $match: { surveyId } },
                { $project: { value: `$answers.${questionId}` } },
                { $match: { value: { $exists: true } } },
                { $group: { _id: "$value", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ];
            const result = await this.db.collection('responses').aggregate(pipeline).toArray();
            const choices: Record<string, number> = {};
            result.forEach(r => { choices[r._id] = r.count; });
            return {
                type: 'single_choice',
                count: result.reduce((sum, r) => sum + r.count, 0),
                choices,
                mostSelected: result.slice(0, 3).map(r => ({ choice: r._id, count: r.count }))
            };
        }
    }

    protected async calculateRatingStats(surveyId: string, questionId: string) {
        const pipeline = [
            { $match: { surveyId } },
            { $project: { value: `$answers.${questionId}` } },
            { $match: { value: { $type: 'number' } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    average: { $avg: "$value" },
                    min: { $min: "$value" },
                    max: { $max: "$value" },
                    values: { $push: "$value" },
                    distribution: { $push: "$value" }
                }
            }
        ];
        const result = await this.db.collection('responses').aggregate(pipeline).toArray();
        const doc = result[0] || { count: 0, average: null, min: null, max: null, values: [], distribution: [] };
        const values = doc.values || [];
        values.sort((a: number, b: number) => a - b);
        const median = values.length ? (values.length % 2 === 0 ? (values[values.length/2-1] + values[values.length/2])/2 : values[Math.floor(values.length/2)]) : null;
        const mode = calculateMode(values);
        const distribution: Record<number, number> = {};
        (doc.distribution || []).forEach((v: number) => { distribution[v] = (distribution[v] || 0) + 1; });
        return {
            type: 'rating',
            count: doc.count,
            average: doc.average,
            min: doc.min,
            max: doc.max,
            median,
            mode,
            distribution,
            values
        };
    }

    protected async calculateRankingStats(surveyId: string, questionId: string) {
        // Not efficient in Mongo, fallback to in-memory for now
        const responses = await this.db.collection('responses')
            .find({ surveyId })
            .project({ _id: 0, value: `$answers.${questionId}` })
            .toArray();
        const values = responses.map((r: any) => r.value).filter((v: any) => Array.isArray(v));
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
        const rankingObjects = values.map((rankingArray: any[]) => {
            const obj: { [key: string]: number } = {};
            rankingArray.forEach((item, index) => {
                obj[item] = index + 1;
            });
            return obj;
        });
        // Calculate average ranking
        const allItems = Array.from(new Set(rankingObjects.flatMap(obj => Object.keys(obj))));
        const averageRankings: Record<string, number> = {};
        for (const item of allItems) {
            const ranks = rankingObjects.map(obj => obj[item]).filter(Boolean);
            averageRankings[item] = ranks.reduce((a, b) => a + b, 0) / ranks.length;
        }
        const sortedItems = Object.entries(averageRankings).sort(([, a], [, b]) => a - b);
        const mostPreferred = sortedItems.slice(0, 3).map(([item, rank]) => ({ item, rank }));
        const leastPreferred = sortedItems.slice(-3).reverse().map(([item, rank]) => ({ item, rank }));
        return {
            type: 'ranking',
            count: values.length,
            averageRankings,
            mostPreferred,
            leastPreferred,
            values: values.slice(0, 10)
        };
    }

    protected async calculateTextStats(surveyId: string, questionId: string) {
        // Not efficient in Mongo, fallback to in-memory for now
        const responses = await this.db.collection('responses')
            .find({ surveyId })
            .project({ _id: 0, value: `$answers.${questionId}`, nlp: `$nlp.${questionId}` })
            .toArray();
        const values = responses.map((r: any) => r.value).filter((v: any) => typeof v === 'string');
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
        const lengths = values.map((v: string) => v.length);
        const nlpData = responses.map((r: any) => r.nlp).filter((nlp: any) => nlp);
        let sentimentAnalysis = null;
        if (nlpData.length > 0) {
            const sentiments = nlpData.map((nlp: any) => nlp.sentiment || { polarity: 0 });
            sentimentAnalysis = {
                average: sentiments.reduce((sum: number, s: any) => sum + s.polarity, 0) / sentiments.length,
                positive: sentiments.filter((s: any) => s.polarity > 0.1).length,
                negative: sentiments.filter((s: any) => s.polarity < -0.1).length,
                neutral: sentiments.filter((s: any) => s.polarity >= -0.1 && s.polarity <= 0.1).length
            };
        }
        const allWords = values.flatMap((text: string) =>
            text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter((word: string) => word.length > 2)
        );
        const wordCounts = allWords.reduce((acc: Record<string, number>, word: string) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {});
        const commonWords = Object.entries(wordCounts)
            .sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
        const median = lengths.length ? (lengths.length % 2 === 0 ? (lengths[lengths.length/2-1] + lengths[lengths.length/2])/2 : lengths[Math.floor(lengths.length/2)]) : 0;
        return {
            type: 'text',
            count: values.length,
            averageLength: lengths.reduce((sum, val) => sum + val, 0) / lengths.length,
            minLength: Math.min(...lengths),
            maxLength: Math.max(...lengths),
            medianLength: median,
            sentimentAnalysis,
            commonWords,
            values: values.slice(0, 10)
        };
    }

    protected async calculateMonthlyStats(surveyId: string, questionId: string, year: number) {
        const pipeline = [
            // Step 1: Filter relevant documents
            {
                $match: {
                    surveyId: surveyId,
                    [`answers.${questionId}`]: { $exists: true, $type: "date" }
                }
            },
            // Step 2: Extract year and month
            {
                $addFields: {
                    eventYear: { $year: `$answers.${questionId}` },
                    eventMonth: { $month: `$answers.${questionId}` }
                }
            },
            // Step 3: Filter by target year (replace 2023 with your year)
            {
                $match: { eventYear: year }
            },
            // Step 4: Group by month to get counts
            {
                $group: {
                    _id: "$eventMonth",
                    count: { $sum: 1 }
                }
            },
            // Step 5: Create template with all 12 months
            {
                $group: {
                    _id: null,
                    monthlyData: { $push: { month: "$_id", count: "$count" } },
                    allMonths: { $first: { $range: [1, 13] } }
                }
            },
            // Step 6: Project to merge template with actual counts
            {
                $project: {
                months: {
                    $map: {
                    input: "$allMonths",
                    as: "m",
                    in: {
                        month: "$$m",
                        count: {
                        $ifNull: [
                            {
                            $let: {
                                vars: {
                                found: {
                                    $arrayElemAt: [
                                    {
                                        $filter: {
                                        input: "$monthlyData",
                                        cond: { $eq: ["$$this.month", "$$m"] }
                                        }
                                    },
                                    0
                                    ]
                                }
                                },
                                in: "$$found.count"
                            }
                            },
                            0
                        ]
                        }
                    }
                    }
                }
                }
            },
            // Step 7: Unwind and format output
            { $unwind: "$months" },
            { $replaceRoot: { newRoot: "$months" } },
            { $sort: { month: 1 } },
            {
                $project: {
                    label: {
                        $switch: {
                            branches: [
                            { case: { $eq: ["$month", 1] }, then: "January" },
                            { case: { $eq: ["$month", 2] }, then: "February" },
                            { case: { $eq: ["$month", 3] }, then: "March" },
                            { case: { $eq: ["$month", 4] }, then: "April" },
                            { case: { $eq: ["$month", 5] }, then: "May" },
                            { case: { $eq: ["$month", 6] }, then: "June" },
                            { case: { $eq: ["$month", 7] }, then: "July" },
                            { case: { $eq: ["$month", 8] }, then: "August" },
                            { case: { $eq: ["$month", 9] }, then: "September" },
                            { case: { $eq: ["$month", 10] }, then: "October" },
                            { case: { $eq: ["$month", 11] }, then: "November" },
                            { case: { $eq: ["$month", 12] }, then: "December" }
                            ],
                            default: "Unknown"
                        }
                    },
                    month: 2,
                    count: 1
                }
            }  
        ];
        const result = await this.db.collection('responses').aggregate(pipeline).toArray();

        return {
            type: 'histogram',
            count: result.length,
            values: result
        };
    }

}
