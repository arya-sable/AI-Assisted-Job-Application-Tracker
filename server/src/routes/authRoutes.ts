import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { protect } from '../middleware/authMiddleware';

const router = Router();

const signToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ message: 'Password must be at least 8 characters' });
    return;
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase(), passwordHash });
    const token = signToken(user._id.toString());

    res.status(201).json({ token, user: { _id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = signToken(user._id.toString());
    res.json({ token, user: { _id: user._id, email: user.email } });
  } catch {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
