# Implementation Guide — AI-Assisted Job Application Tracker

**Version:** 1.0  
**Stack:** MERN · TypeScript · Tailwind CSS · OpenAI API  
**Estimated Duration:** 3–4 Days  

---

## Table of Contents

1. [Day-by-Day Plan](#1-day-by-day-plan)
2. [Repository Structure](#2-repository-structure)
3. [Environment Setup](#3-environment-setup)
4. [Backend Implementation](#4-backend-implementation)
5. [Frontend Implementation](#5-frontend-implementation)
6. [AI Service Layer](#6-ai-service-layer)
7. [Drag-and-Drop Kanban](#7-drag-and-drop-kanban)
8. [State Management](#8-state-management)
9. [Key TypeScript Types](#9-key-typescript-types)
10. [Error Handling Patterns](#10-error-handling-patterns)
11. [Environment Variables](#11-environment-variables)
12. [Running the Project](#12-running-the-project)
13. [Deployment (Bonus)](#13-deployment-bonus)
14. [Commit Strategy](#14-commit-strategy)
15. [Architecture Decisions](#15-architecture-decisions)

---

## 1. Day-by-Day Plan

### Day 1 — Foundation (Backend + Auth)
- [ ] Initialise monorepo (`client/`, `server/`)
- [ ] Configure TypeScript for both workspaces
- [ ] Set up Express server with middleware (cors, helmet, morgan)
- [ ] Connect Mongoose to MongoDB Atlas
- [ ] Build `User` model + `auth` routes (register, login, `/me`)
- [ ] Implement JWT middleware (`authMiddleware.ts`)
- [ ] Test auth endpoints with Postman/Thunder Client

### Day 2 — Core API + Kanban UI
- [ ] Build `Application` model + all CRUD routes
- [ ] Initialise React + Vite + TypeScript + Tailwind CSS frontend
- [ ] Implement auth pages (Register, Login)
- [ ] Set up React Query + Axios instance with JWT interceptor
- [ ] Build static Kanban board with 5 columns
- [ ] Implement `ApplicationCard` and drag-and-drop (dnd-kit)

### Day 3 — AI Integration
- [ ] Build `aiService.ts` (OpenAI parse + resume suggestions)
- [ ] Build `/api/ai/parse` route
- [ ] Build `AddApplicationModal` with JD textarea + Parse button
- [ ] Wire AI response to pre-fill form fields
- [ ] Display `ResumeSuggestions` with copy buttons
- [ ] Handle all loading, error, and empty states

### Day 4 — Polish, Testing & Submission
- [ ] Application detail view (edit + delete)
- [ ] Form validation (frontend + backend)
- [ ] Error toast system
- [ ] Skeleton loaders for board
- [ ] `.env.example`, README
- [ ] Final TypeScript audit (`any` cleanup)
- [ ] Push to GitHub, write README

---

## 2. Repository Structure

```
job-tracker/
├── client/                          # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.ts     # Base axios config + JWT interceptor
│   │   │   ├── authApi.ts
│   │   │   ├── applicationsApi.ts
│   │   │   └── aiApi.ts
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── board/
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── KanbanColumn.tsx
│   │   │   │   └── ApplicationCard.tsx
│   │   │   ├── application/
│   │   │   │   ├── AddApplicationModal.tsx
│   │   │   │   ├── ApplicationDetailView.tsx
│   │   │   │   ├── ApplicationForm.tsx
│   │   │   │   └── ResumeSuggestions.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Spinner.tsx
│   │   │       ├── Toast.tsx
│   │   │       └── SkeletonCard.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useApplications.ts
│   │   │   └── useAiParse.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── BoardPage.tsx
│   │   │   └── ApplicationDetailPage.tsx
│   │   ├── types/
│   │   │   └── index.ts             # All shared frontend types
│   │   ├── utils/
│   │   │   └── formatDate.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                          # Express + TypeScript
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                # Mongoose connection
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts    # JWT verify
│   │   │   └── errorHandler.ts     # Global error handler
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Application.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── applicationRoutes.ts
│   │   │   └── aiRoutes.ts
│   │   ├── services/
│   │   │   └── aiService.ts         # All OpenAI logic lives here
│   │   ├── types/
│   │   │   └── index.ts             # Backend types + express augmentation
│   │   └── index.ts                 # Express app entry point
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

## 3. Environment Setup

### 3.1 Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- OpenAI API key

### 3.2 Initialise Server

```bash
mkdir job-tracker && cd job-tracker
mkdir server && cd server
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors helmet morgan dotenv openai
npm install -D typescript ts-node-dev @types/express @types/mongoose \
  @types/bcryptjs @types/jsonwebtoken @types/cors @types/morgan
npx tsc --init
```

**`server/tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**`server/package.json` scripts:**
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 3.3 Initialise Client

```bash
cd ../
npm create vite@latest client -- --template react-ts
cd client
npm install
npm install axios @tanstack/react-query react-router-dom @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 4. Backend Implementation

### 4.1 Entry Point — `server/src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import applicationRoutes from './routes/applicationRoutes';
import aiRoutes from './routes/aiRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

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

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
```

### 4.2 Database Connection — `server/src/config/db.ts`

```typescript
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables');
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};
```

### 4.3 User Model — `server/src/models/User.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
```

### 4.4 Application Model — `server/src/models/Application.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export type ApplicationStatus =
  | 'Applied'
  | 'Phone Screen'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: Date;
  status: ApplicationStatus;
  salaryRange?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    jdLink: { type: String, trim: true },
    notes: { type: String },
    dateApplied: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    salaryRange: { type: String },
    requiredSkills: [{ type: String }],
    niceToHaveSkills: [{ type: String }],
    seniority: { type: String },
    location: { type: String },
    resumeSuggestions: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IApplication>('Application', ApplicationSchema);
```

### 4.5 JWT Middleware — `server/src/middleware/authMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

### 4.6 Auth Routes — `server/src/routes/authRoutes.ts`

```typescript
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
```

### 4.7 Application Routes — `server/src/routes/applicationRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';
import Application from '../models/Application';
import { protect } from '../middleware/authMiddleware';

const router = Router();
router.use(protect); // All routes require auth

// GET /api/applications
router.get('/', async (req: Request, res: Response) => {
  const applications = await Application.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(applications);
});

// POST /api/applications
router.post('/', async (req: Request, res: Response) => {
  const app = await Application.create({ ...req.body, userId: req.userId });
  res.status(201).json(app);
});

// GET /api/applications/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const app = await Application.findOne({ _id: req.params.id, userId: req.userId });
  if (!app) { res.status(404).json({ message: 'Application not found' }); return; }
  res.json(app);
});

// PATCH /api/applications/:id
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!app) { res.status(404).json({ message: 'Application not found' }); return; }
  res.json(app);
});

// DELETE /api/applications/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const app = await Application.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!app) { res.status(404).json({ message: 'Application not found' }); return; }
  res.json({ message: 'Application deleted' });
});

export default router;
```

### 4.8 Global Error Handler — `server/src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
};
```

---

## 5. Frontend Implementation

### 5.1 Tailwind Configuration — `client/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#01696f', hover: '#0c4e54' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

### 5.2 Axios Instance — `client/src/api/axiosInstance.ts`

```typescript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 5.3 Auth Context — `client/src/context/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../api/axiosInstance';

interface User {
  _id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      axiosInstance
        .get('/auth/me')
        .then((res) => {
          setUser(res.data);
          setToken(storedToken);
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
```

### 5.4 Protected Route Wrapper

```typescript
// client/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './ui/Spinner';

interface Props { children: React.ReactNode; }

export const ProtectedRoute = ({ children }: Props) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
```

### 5.5 App Router — `client/src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BoardPage from './pages/BoardPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/board" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/board"
              element={<ProtectedRoute><BoardPage /></ProtectedRoute>}
            />
            <Route
              path="/applications/:id"
              element={<ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

## 6. AI Service Layer

### 6.1 AI Service — `server/src/services/aiService.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ParsedJobDescription {
  companyName: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
  resumeSuggestions: string[];
}

const PARSE_SYSTEM_PROMPT = `You are an expert recruiter. Extract structured data from job descriptions.
Return ONLY valid JSON matching this exact schema — no markdown, no extra text:
{
  "companyName": string,
  "role": string,
  "requiredSkills": string[],
  "niceToHaveSkills": string[],
  "seniority": string,
  "location": string,
  "resumeSuggestions": string[]  // 3-5 specific resume bullet points tailored to this role
}
Resume bullet points must:
- Start with a strong action verb (Built, Designed, Reduced, Implemented, Led...)
- Reference specific technologies or skills from the JD
- Include a measurable outcome where possible
- Be specific to THIS role, not generic advice`;

export const parseJobDescription = async (
  jobDescription: string
): Promise<ParsedJobDescription> => {
  if (!jobDescription?.trim()) {
    throw new Error('Job description cannot be empty');
  }

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: PARSE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Parse this job description:\n\n${jobDescription.slice(0, 8000)}`, // Limit input size
      },
    ],
    temperature: 0.3,
    max_tokens: 1500,
  });

  const rawContent = response.choices[0]?.message?.content;
  if (!rawContent) throw new Error('OpenAI returned an empty response');

  const parsed = JSON.parse(rawContent) as Partial<ParsedJobDescription>;

  // Validate required fields — never return partial data
  const required: (keyof ParsedJobDescription)[] = [
    'companyName', 'role', 'requiredSkills', 'niceToHaveSkills',
    'seniority', 'location', 'resumeSuggestions',
  ];

  for (const field of required) {
    if (parsed[field] === undefined || parsed[field] === null) {
      throw new Error(`AI response missing required field: ${field}`);
    }
  }

  return {
    companyName: parsed.companyName ?? '',
    role: parsed.role ?? '',
    requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
    niceToHaveSkills: Array.isArray(parsed.niceToHaveSkills) ? parsed.niceToHaveSkills : [],
    seniority: parsed.seniority ?? '',
    location: parsed.location ?? '',
    resumeSuggestions: Array.isArray(parsed.resumeSuggestions)
      ? parsed.resumeSuggestions.slice(0, 5)
      : [],
  };
};
```

### 6.2 AI Route — `server/src/routes/aiRoutes.ts`

```typescript
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
    // Distinguish between our validation errors and OpenAI errors
    const isClientError = message.includes('empty') || message.includes('missing required field');
    res.status(isClientError ? 400 : 502).json({ message });
  }
});

export default router;
```

### 6.3 Frontend AI Hook — `client/src/hooks/useAiParse.ts`

```typescript
import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import type { ParsedJobDescription } from '../types';

interface UseAiParseReturn {
  parse: (jobDescription: string) => Promise<ParsedJobDescription | null>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useAiParse = (): UseAiParseReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parse = async (jobDescription: string): Promise<ParsedJobDescription | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post<ParsedJobDescription>('/ai/parse', { jobDescription });
      return res.data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to parse job description. Please try again.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => setError(null);

  return { parse, isLoading, error, reset };
};
```

---

## 7. Drag-and-Drop Kanban

### 7.1 Kanban Board — `client/src/components/board/KanbanBoard.tsx`

```typescript
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import ApplicationCard from './ApplicationCard';
import { APPLICATION_STATUSES } from '../../types';
import type { Application, ApplicationStatus } from '../../types';
import { useUpdateApplication } from '../../hooks/useApplications';

interface Props {
  applications: Application[];
}

export default function KanbanBoard({ applications }: Props) {
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const { mutate: updateApplication } = useUpdateApplication();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApp(null);

    if (!over) return;

    const draggedId = active.id as string;
    const newStatus = over.id as ApplicationStatus;

    if (!APPLICATION_STATUSES.includes(newStatus)) return;

    const app = applications.find((a) => a._id === draggedId);
    if (!app || app.status === newStatus) return;

    updateApplication({ id: draggedId, data: { status: newStatus } });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => {
        const app = applications.find((a) => a._id === e.active.id);
        setActiveApp(app ?? null);
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto h-full pb-4">
        {APPLICATION_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applications.filter((a) => a.status === status)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApp && <ApplicationCard application={activeApp} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
```

### 7.2 Kanban Column — `client/src/components/board/KanbanColumn.tsx`

```typescript
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ApplicationCard from './ApplicationCard';
import type { Application, ApplicationStatus } from '../../types';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: 'bg-blue-100 text-blue-800',
  'Phone Screen': 'bg-yellow-100 text-yellow-800',
  Interview: 'bg-purple-100 text-purple-800',
  Offer: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

interface Props {
  status: ApplicationStatus;
  applications: Application[];
}

export default function KanbanColumn({ status, applications }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 flex-shrink-0 rounded-xl bg-gray-50 transition-colors ${
        isOver ? 'bg-gray-100 ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h2 className="font-semibold text-sm text-gray-700">{status}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status]}`}>
          {applications.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-2 flex-1 overflow-y-auto">
        <SortableContext
          items={applications.map((a) => a._id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <ApplicationCard key={app._id} application={app} />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 8. State Management

### 8.1 React Query Hooks — `client/src/hooks/useApplications.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import type { Application, CreateApplicationInput, UpdateApplicationInput } from '../types';

const QUERY_KEY = ['applications'] as const;

// Fetch all applications
export const useApplications = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<Application[]>('/applications');
      return res.data;
    },
  });

// Create
export const useCreateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateApplicationInput) => {
      const res = await axiosInstance.post<Application>('/applications', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

// Update (used for drag-and-drop status change + edit form)
export const useUpdateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: UpdateApplicationInput) => {
      const res = await axiosInstance.patch<Application>(`/applications/${id}`, data);
      return res.data;
    },
    onMutate: async ({ id, data }) => {
      // Optimistic update for smooth drag-and-drop
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData<Application[]>(QUERY_KEY);
      qc.setQueryData<Application[]>(QUERY_KEY, (old) =>
        old?.map((app) => (app._id === id ? { ...app, ...data } : app)) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(QUERY_KEY, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

// Delete
export const useDeleteApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/applications/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
```

---

## 9. Key TypeScript Types

### `client/src/types/index.ts`

```typescript
export const APPLICATION_STATUSES = [
  'Applied',
  'Phone Screen',
  'Interview',
  'Offer',
  'Rejected',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  _id: string;
  userId: string;
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: string; // ISO string from MongoDB
  status: ApplicationStatus;
  salaryRange?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationInput {
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: string;
  status?: ApplicationStatus;
  salaryRange?: string;
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions?: string[];
}

export interface UpdateApplicationInput {
  id: string;
  data: Partial<Omit<Application, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>;
}

export interface ParsedJobDescription {
  companyName: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
  resumeSuggestions: string[];
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
  };
}

export interface ApiError {
  message: string;
}
```

---

## 10. Error Handling Patterns

### 10.1 Frontend Toast System

Use a lightweight toast library (e.g., `react-hot-toast`) for non-blocking error feedback:

```bash
npm install react-hot-toast
```

```typescript
// In App.tsx — add at the root
import { Toaster } from 'react-hot-toast';
// <Toaster position="top-right" />

// In any component
import toast from 'react-hot-toast';
toast.error('Failed to parse job description. Please try again.');
toast.success('Application saved!');
```

### 10.2 AI Parse Error Boundary Pattern

```typescript
// In AddApplicationModal.tsx
const { parse, isLoading, error } = useAiParse();

const handleParse = async () => {
  if (!jdText.trim()) {
    toast.error('Please paste a job description first');
    return;
  }
  const result = await parse(jdText);
  if (result) {
    // Pre-fill form
    setFormData({
      company: result.companyName,
      role: result.role,
      location: result.location,
      requiredSkills: result.requiredSkills,
      niceToHaveSkills: result.niceToHaveSkills,
      seniority: result.seniority,
      resumeSuggestions: result.resumeSuggestions,
    });
  }
  // If result is null, error is set in the hook and displayed inline
};
```

### 10.3 Backend Async Wrapper

To avoid try/catch in every route, use a wrapper utility:

```typescript
// server/src/utils/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Usage in routes:
router.get('/', asyncHandler(async (req, res) => {
  const apps = await Application.find({ userId: req.userId });
  res.json(apps);
}));
```

---

## 11. Environment Variables

### `server/.env.example`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/jobtracker?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_very_long_random_secret_here_minimum_32_chars

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# CORS
CLIENT_URL=http://localhost:5173
```

### `client/.env.example`

```env
VITE_API_URL=http://localhost:5000/api
```

> **Never commit `.env` files. Add them to `.gitignore` immediately.**

---

## 12. Running the Project

### Prerequisites
- Node.js 18+
- MongoDB Atlas connection string
- OpenAI API key

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/job-tracker.git
cd job-tracker

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Configuration

```bash
# Server
cp server/.env.example server/.env
# Fill in MONGODB_URI, JWT_SECRET, OPENAI_API_KEY

# Client
cp client/.env.example client/.env
# VITE_API_URL defaults to http://localhost:5000/api
```

### Start Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 13. Deployment (Bonus)

### Backend — Render / Railway

1. Push `server/` to a GitHub repository.
2. Create a new Web Service on [Render](https://render.com).
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Add all environment variables from `.env` in the Render dashboard.

### Frontend — Vercel

1. Push `client/` to GitHub.
2. Import the project on [Vercel](https://vercel.com).
3. Set **Framework Preset**: Vite.
4. Add `VITE_API_URL` pointing to your deployed Render backend URL.
5. Deploy.

---

## 14. Commit Strategy

Use conventional commits for a clean history:

```
feat: initialise MERN monorepo with TypeScript config
feat(server): add User model and auth routes (register, login)
feat(server): add JWT middleware for protected routes
feat(server): add Application CRUD routes
feat(server): add AI service and parse route using OpenAI JSON mode
feat(client): scaffold Vite + React + Tailwind setup
feat(client): add auth context and protected routes
feat(client): build static Kanban board layout
feat(client): implement drag-and-drop with dnd-kit
feat(client): add AddApplicationModal with AI parse integration
feat(client): add ResumeSuggestions component with copy buttons
feat(client): add skeleton loaders and empty states
fix(server): handle malformed OpenAI response gracefully
fix(client): show inline error when AI parse fails
chore: add .env.example and update README
```

> Commit at the end of every feature, not at the end of the day.

---

## 15. Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend framework** | React + Vite | Faster HMR than CRA; TypeScript template out of the box |
| **State management** | React Query | Server state (API data) is the primary concern; Redux is overkill for this scope |
| **Drag-and-drop** | `@dnd-kit` | Tree-shakeable, accessible, TypeScript-first; lighter than `react-beautiful-dnd` |
| **AI model** | `gpt-4o-mini` | Cost-efficient for structured JSON extraction; configurable via env |
| **JSON mode** | `response_format: { type: "json_object" }` | Eliminates markdown code-block wrapping and parse failures |
| **Auth storage** | `localStorage` for JWT | Simple for demo scope; production would use `httpOnly` cookies |
| **Optimistic updates** | React Query `onMutate` | Makes drag-and-drop feel instant without waiting for the PATCH response |
| **AI layer** | Dedicated `aiService.ts` | Keeps route handlers thin; AI logic is testable and swappable |
| **Error handling** | Per-hook + global toast | Local errors stay local (inline under textarea); network/server errors go to toast |
| **TypeScript strict** | `"strict": true` | Catches type errors early; no `any` except with explicit comment justification |

---

*This implementation guide is intended as a step-by-step reference. Always read and understand each code block before copying — adapt field names, styles, and logic to your implementation.*
