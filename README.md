# AI-Assisted Job Application Tracker

A full-stack application that helps job seekers manage their job applications on a visual Kanban board. Features an AI-powered job description parser (Groq / LLaMA) that extracts structured data and generates tailored resume bullet-point suggestions.

**Live Demo:** [AI Job Tracker](https://ai-assisted-job-tracker.pages.dev)

**Backend API:** [Render](https://ai-assisted-job-application-tracker-s2ee.onrender.com)
---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4 |
| UI | shadcn/ui pattern (CVA + Radix UI primitives), Lucide icons |
| State | TanStack React Query (optimistic updates) |
| Drag & Drop | @dnd-kit |
| Backend | Express, TypeScript, MongoDB (Mongoose) |
| AI | Groq SDK (LLaMA 3.1) with JSON response mode |
| Auth | JWT (Bearer token) + bcrypt |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Features

### Core
- **AI Job Description Parser** — Paste any JD and auto-extract company, role, location, seniority, required skills, nice-to-have skills, and 3-5 resume bullet suggestions
- **Kanban Board** — 5-stage pipeline: Applied → Phone Screen → Interview → Offer → Rejected
- **Drag & Drop** — Move cards between stages with smooth animations and toast confirmation
- **Full CRUD** — Create, view, edit, and delete applications with all fields
- **Authentication** — Register/login with JWT; all data scoped to the logged-in user

### Stretch Goals (all implemented)
- **Dashboard Stats** — Response rate, offer rate, total applications, follow-up count
- **Follow-up Reminders** — Amber alerts on cards idle for 7+ days; filterable
- **Search, Filter & Sort** — Full-text search, status filter, sort by date/company, follow-ups toggle
- **CSV Export** — Export filtered applications with proper quoting
- **Dark Mode** — Full dark theme on every component with toggle (Sun/Moon icon) and keyboard shortcut (`D`)

### Extra Polish
- Keyboard shortcuts: `N` (add), `/` (search), `D` (dark mode)
- Micro-interactions: button press, card lift, input glow, stagger animations
- Landing page with feature grid, how-it-works section, and social proof
- Themed toast notifications (dark-aware)
- SPA routing via `vercel.json` rewrites

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB Atlas** account (free tier works)
- **Groq API key** — get one at [console.groq.com](https://console.groq.com)

### Installation

```bash
# Clone the repo
git clone https://github.com/arya-sable/AI-Assisted-Job-Application-Tracker.git
cd AI-Assisted-Job-Application-Tracker

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Variables

Create `.env` files from the examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Server (`server/.env`):**

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/jobtracker` |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) | `a_very_long_random_string_here` |
| `GROQ_API_KEY` | Groq API key for AI features | `gsk_...` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development` |

**Client (`client/.env`):**

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

### Running Locally

```bash
# Terminal 1 — Start the backend
cd server
npm run dev          # runs on http://localhost:5000

# Terminal 2 — Start the frontend
cd client
npm run dev          # runs on http://localhost:5173
```

---

## Project Structure

```
├── client/                        # React + Vite + TypeScript
│   └── src/
│       ├── api/                   # Axios instance + API functions
│       ├── components/
│       │   ├── application/       # AddApplicationModal, ResumeSuggestions
│       │   ├── auth/              # LoginForm, RegisterForm
│       │   ├── board/             # KanbanBoard, KanbanColumn, ApplicationCard, BoardInsights
│       │   ├── shadcn/            # Button, Input, Badge, Separator (CVA)
│       │   └── ui/                # Modal, ConfirmDialog, Spinner, SkeletonCard, ThemeToggle
│       ├── context/               # AuthContext, ThemeContext
│       ├── hooks/                 # useApplications (React Query), useAiParse
│       ├── pages/                 # LandingPage, BoardPage, ApplicationDetailPage, Login, Register
│       ├── types/                 # Shared TypeScript interfaces
│       └── utils/                 # formatDate, applicationMetrics
│
├── server/                        # Express + TypeScript
│   └── src/
│       ├── config/                # MongoDB connection
│       ├── middleware/            # JWT auth middleware, error handler
│       ├── models/               # User, Application (Mongoose)
│       ├── routes/               # auth, applications, ai routes
│       ├── services/             # AI service (Groq SDK)
│       ├── types/                # Server-side type definitions
│       └── utils/                # asyncHandler wrapper
```

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Applications (all protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/applications` | List all applications |
| POST | `/api/applications` | Create an application |
| GET | `/api/applications/:id` | Get single application |
| PATCH | `/api/applications/:id` | Update an application |
| DELETE | `/api/applications/:id` | Delete an application |

### AI (protected)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/parse` | Parse JD text → structured data + resume suggestions |

---

## Key Decisions

1. **Groq (LLaMA 3.1) over OpenAI** — Chose Groq for its free tier and fast inference. The `response_format: { type: 'json_object' }` flag ensures structured output without fragile regex parsing.

2. **shadcn/ui pattern (manual, no CLI)** — Used Class Variance Authority (CVA) + Radix UI primitives to build a design system without the shadcn CLI dependency. This keeps the component library fully owned and customizable.

3. **Tailwind CSS v4 with `@custom-variant`** — Dark mode uses `@custom-variant dark (&:where(.dark, .dark *))` with a class toggle on `<html>`, avoiding the deprecated `darkMode: 'class'` config.

4. **React Query with optimistic updates** — Drag-and-drop status changes are reflected instantly in the UI while the PATCH request runs in the background. Failed mutations roll back automatically.

5. **Service layer for AI** — AI logic lives in `services/aiService.ts`, not in route handlers. This keeps routes thin and makes the AI provider swappable.

6. **JWT stored in localStorage** — Simpler than httpOnly cookies for a single-page app. The axios interceptor auto-attaches the token and redirects to `/login` on 401.

7. **Default light mode** — New users see light mode by default. The preference is persisted to `localStorage` once toggled.

8. **MongoDB Atlas** — Chose a managed cloud database to avoid local setup complexity. The free M0 tier is sufficient for this project.

9. **Monorepo structure** — Client and server in one repo with separate `package.json` files. Simplifies deployment (Render reads `server/`, Vercel reads `client/`).

10. **Input truncation (8000 chars)** — JD text sent to the AI is capped at 8,000 characters to stay within token limits and reduce latency.

---

## Deployment

- **Frontend:** Vercel — auto-deploys from `main` branch, root directory set to `client/`
- **Backend:** Render — auto-deploys from `main` branch, root directory set to `server/`
- **Database:** MongoDB Atlas (M0 free tier)

See the deployment section in the project docs for detailed setup steps.

