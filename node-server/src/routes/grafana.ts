// node-server/src/routes/grafanaRoutes.ts
import { Router } from 'express';
import { getDb } from '../db';

export const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Grafana data source is running",
    routes: {
      query: "/grafana/query",
      annotations: "/grafana/annotations",
      search: "/grafana/search"
    }
  });
});

router.post("/search", (req, res) => {
  try {
    const { query } = req.body;
    
    // Example search logic, modify as needed
    if (query === 'response_count') {
      return res.json(['response_count']);
    }
    
    res.json([]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/query", async (req, res) => {
  try {
    const { targets, range } = req.body;
    const from = new Date(range.from).getTime();
    const to = new Date(range.to).getTime();
    
    const results = await Promise.all(targets.map(async (target: any) => {
      if (target.target === 'response_count') {
        // const count = await getDb().collection('responses').countDocuments({
        //   createdAt: { $gte: new Date(from), $lte: new Date(to) }
        // });
        const count = Math.floor(Math.random() * 100); // Simulated count for testing
        return {
          target: "response_count",
          datapoints: [[count, Date.now()]]
        };
      }
      return null;
    }));

    // Example response format for Grafana table panel
    // [
    //   {
    //     "columns":[
    //       {"text":"Time","type":"time"},
    //       {"text":"Country","type":"string"},
    //       {"text":"Number","type":"number"}
    //     ],
    //     "rows":[
    //       [1234567,"SE",123],
    //       [1234567,"DE",231],
    //       [1234567,"US",321]
    //     ],
    //     "type":"table"
    //   }
    // ]

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
