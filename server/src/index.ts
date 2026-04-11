import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import applicationRoutes from './routes/applicationRoutes';
import aiRoutes from './routes/aiRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
