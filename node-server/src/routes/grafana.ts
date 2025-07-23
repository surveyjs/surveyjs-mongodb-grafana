// node-server/src/routes/grafanaRoutes.ts
import { Router } from 'express';
import { getDb, getRedisClient } from '../db';
import { SurveyAnalytics } from '../services/analytics';
import { SurveyModel } from 'survey-core';

export const router = Router();

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

router.post("/search", async (req, res) => {
  const db = getDb();
  try {
    const { query } = req.body;
    
    // Example search logic, modify as needed
    if (query === 'response_count' || query === 'table_data') {
      return res.json([query]);
    }
    
    const survey = await db.collection<{_id: string, json: any}>('surveys').findOne({ _id: query.surveyId || "burger_survey_2023" });
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    const surveyModel = new SurveyModel(survey.json);
    res.json((surveyModel.getAllQuestions() || []).map(q => ({ label: q.text || q.title, value: q.name || q.id })));

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/query", async (req, res) => {
  const db = getDb();
  const redisClient = getRedisClient();
  const surveyAnalytics = new SurveyAnalytics(db, redisClient);
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
          const stats = await surveyAnalytics.getQuestionStats(target.surveyId, target.questionId);
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
