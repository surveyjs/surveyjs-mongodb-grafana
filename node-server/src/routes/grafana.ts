// node-server/src/routes/grafanaRoutes.ts
import { Router } from 'express';
import { getDb } from '../db';

export const router = Router();

router.get('/query', async (req, res) => {
  try {
    const { target, from, to } = req.query;
    
    if (target === 'response_count') {
      const count = await getDb().collection('responses').countDocuments();
      return res.json([
        {
          target: "response_count",
          datapoints: [[count, Date.now()]]
        }
      ]);
    }
    
    res.json([]);
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