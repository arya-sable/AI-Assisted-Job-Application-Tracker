import { Router, Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware';
import { parseJobDescription } from '../services/aiService';

const router = Router();
router.use(protect);

// POST /api/ai/parse
router.post('/parse', async (req: Request, res: Response): Promise<void> => {
  const { jobDescription } = req.body as { jobDescription?: string };

  if (!jobDescription?.trim()) {
    res.status(400).json({ message: 'jobDescription is required' });
    return;
  }

  try {
    const result = await parseJobDescription(jobDescription);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI parsing failed';
    const isClientError = message.includes('empty') || message.includes('missing required field');
    res.status(isClientError ? 400 : 502).json({ message });
  }
});

export default router;
