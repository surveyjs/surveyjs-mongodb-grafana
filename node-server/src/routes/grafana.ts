// node-server/src/routes/grafanaRoutes.ts
import { Router } from 'express';
import { getDb, getRedisClient } from '../db';
import { SurveyModel } from 'survey-core';
import { SurveyAnalyticsInMemory } from '../services/analytics-in-memory';
import { SurveyAnalyticsMongo } from '../services/analytics-mongo';

export const router = Router();

/**
 * GET /
 * Returns API information and available routes for Grafana datasource
 * @returns JSON response with API information and route descriptions
 */
router.get("/", (req, res) => {
  res.json({
    message: "SurveyJS Grafana data source API is running",
    routes: {
      query: "/grafana/query",
      annotations: "/grafana/annotations",
      search: "/grafana/search"
    }
  });
});

/**
 * POST /search
 * Searches for surveys and questions to populate Grafana dropdowns
 * @param query - Search query object from request body
 * @param query.surveyId - Optional survey ID to search within
 * @returns JSON response with available surveys or questions for selection
 */
router.post("/search", async (req, res) => {
  const db = getDb();
  try {
    const { query } = req.body;
    
    if(!query.surveyId) {
      const surveys = await db.collection<{_id: string, name?: string, json: any}>('surveys').find({}).sort({ _id: 1 }).toArray();
      return res.json(surveys.map(s => ({ label: s.json?.title || s.name, value: s.json?.id || s._id })));
    }
    
    const survey = await db.collection<{_id: string, json: any}>('surveys').findOne({ _id: query.surveyId });
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    const surveyModel = new SurveyModel(survey.json);
    res.json((surveyModel.getAllQuestions() || []).map(q => ({ label: q.text || q.title, value: q.name || q.id })));

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /query
 * Executes data queries for Grafana dashboards
 * @param targets - Array of query targets from request body
 * @param range - Time range object with from/to timestamps
 * @returns JSON response with query results for each target
 */
router.post("/query", async (req, res) => {
  const db = getDb();
  const redisClient = getRedisClient();
  const surveyAnalytics = new SurveyAnalyticsMongo(db, redisClient);
  try {
    const { targets, range } = req.body;
    const from = new Date(range.from).getTime();
    const to = new Date(range.to).getTime();
    
    const results = await Promise.all(targets.map(async (target: any) => {
      if (!!target.surveyId) {
          if(!target.questionId) {
            // const count = await getDb().collection('responses').countDocuments({
            //   createdAt: { $gte: new Date(from), $lte: new Date(to) }
            // });
            const totalCount = await db.collection('responses').countDocuments({ surveyId: target.surveyId });
            return {
              type: 'total',
              count: totalCount
            }
          }
          const stats = await surveyAnalytics.getQuestionStats(target.surveyId, target.questionId, target.queryText);
          return stats;
      }
      // Example test data, modify as needed
      if (target.target === 'response_count') {
        const count = Math.floor(Math.random() * 100); // Simulated count for testing
        return {
          target: "response_count",
          datapoints: [[count, Date.now()]]
        };
      }
      if (target.target === 'table_data') {
        return {
          "columns":[
            {"text":"Country","type":"string"},
            {"text":"Number","type":"number"}
          ],
          "rows":[
            ["UK", Math.floor(Math.random() * 100)],
            ["SE", Math.floor(Math.random() * 100)],
            ["DE", Math.floor(Math.random() * 100)],
            ["US", Math.floor(Math.random() * 100)]
          ],
          "type":"table"
        };
      }
      return null;
    }));


    res.json(results.filter(r => r !== null));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /annotations
 * Retrieves annotations for Grafana time series
 * @param from - Start timestamp from query parameters
 * @param to - End timestamp from query parameters
 * @returns JSON response with annotation data for the time range
 */
router.get('/annotations', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    const annotations = await getDb().collection('responses').find({
      createdAt: { $gte: new Date(Number(from)), $lte: new Date(Number(to)) }
    }).toArray();
    
    res.json(annotations.map(a => ({
      time: a.createdAt.getTime(),
      text: `Response from ${a.userId}`,
      tags: ['response']
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
