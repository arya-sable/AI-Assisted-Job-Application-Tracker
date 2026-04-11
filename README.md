# AI-Assisted Job Application Tracker

A full-stack MERN application that helps job seekers manage their applications on a visual Kanban board. Features an AI-powered job description parser that extracts structured data and generates tailored resume bullet-point suggestions.

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS v4
- **Backend:** Express + TypeScript + MongoDB (Mongoose)
- **AI:** OpenAI API (gpt-4o-mini) with JSON mode
- **State Management:** React Query (TanStack Query)
- **Drag & Drop:** @dnd-kit

## Features

- **Authentication** — Register/login with JWT-based auth
- **Kanban Board** — 5 columns: Applied, Phone Screen, Interview, Offer, Rejected
- **Drag & Drop** — Move cards between columns with optimistic updates
- **AI Job Description Parser** — Paste a JD, extract company, role, skills, location, seniority
- **AI Resume Suggestions** — 3-5 tailored bullet points with one-click copy
- **Full CRUD** — Create, read, update, delete applications
- **Responsive UI** — Desktop and tablet friendly

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- OpenAI API key

### Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Configuration

```bash
# Server — copy and fill in your values
cp server/.env.example server/.env

# Client — copy and fill in your values
cp client/.env.example client/.env
```

**Server `.env` variables:**

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | Model to use (default: gpt-4o-mini) |
| `CLIENT_URL` | Frontend URL for CORS (default: http://localhost:5173) |

**Client `.env` variables:**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: http://localhost:5000/api) |

### Running

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
├── client/                     # React + Vite + TypeScript
│   └── src/
│       ├── api/                # Axios instance + API functions
│       ├── components/         # UI components (auth, board, application, ui)
│       ├── context/            # Auth context
│       ├── hooks/              # React Query hooks + AI parse hook
│       ├── pages/              # Route pages
│       ├── types/              # Shared TypeScript types
│       └── utils/              # Utility functions
│
├── server/                     # Express + TypeScript
│   └── src/
│       ├── config/             # Database connection
│       ├── middleware/         # Auth + error handling
│       ├── models/            # Mongoose models
│       ├── routes/            # API routes
│       ├── services/          # AI service (OpenAI)
│       └── utils/             # Async handler
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/auth/me` — Get current user (protected)

### Applications
- `GET /api/applications` — Get all applications (protected)
- `POST /api/applications` — Create application (protected)
- `GET /api/applications/:id` — Get single application (protected)
- `PATCH /api/applications/:id` — Update application (protected)
- `DELETE /api/applications/:id` — Delete application (protected)

### AI
- `POST /api/ai/parse` — Parse JD text, returns structured data + resume suggestions (protected)
