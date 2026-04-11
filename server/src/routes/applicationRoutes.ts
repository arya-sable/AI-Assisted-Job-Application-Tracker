import { Router, Request, Response } from 'express';
import Application from '../models/Application';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(protect);

// GET /api/applications
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const applications = await Application.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(applications);
}));

// POST /api/applications
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const app = await Application.create({ ...req.body, userId: req.userId });
  res.status(201).json(app);
}));

// GET /api/applications/:id
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const app = await Application.findOne({ _id: req.params.id, userId: req.userId });
  if (!app) { res.status(404).json({ message: 'Application not found' }); return; }
  res.json(app);
}));

// PATCH /api/applications/:id
router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!app) { res.status(404).json({ message: 'Application not found' }); return; }
  res.json(app);
}));

// DELETE /api/applications/:id
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const app = await Application.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!app) { res.status(404).json({ message: 'Application not found' }); return; }
  res.json({ message: 'Application deleted' });
}));

export default router;
