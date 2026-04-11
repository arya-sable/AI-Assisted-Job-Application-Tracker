# Product Requirements Document — AI-Assisted Job Application Tracker

**Version:** 1.0  
**Status:** Draft  
**Duration:** 3–4 Days  
**Stack:** MERN · TypeScript · Tailwind CSS · OpenAI API  

---

## 1. Executive Summary

The AI-Assisted Job Application Tracker is a full-stack web application that helps job seekers manage their applications on a visual Kanban board. The core differentiator is an AI-powered job description parser that extracts structured data from raw JDs and generates tailored resume bullet-point suggestions, eliminating manual data entry and helping users optimise their applications.

---

## 2. Goals & Success Metrics

### 2.1 Product Goals

- Reduce time-to-create a new application card from ~3 minutes (manual entry) to under 30 seconds (AI-parsed).
- Give users a clear, drag-and-drop pipeline view of every active job hunt.
- Surface AI-generated, role-specific resume suggestions that users can copy with one click.

### 2.2 Success Metrics

| Metric | Target |
|--------|--------|
| AI parse success rate (valid JSON returned) | ≥ 95% |
| Card creation time (paste JD → saved card) | < 30 seconds |
| Frontend crash rate on bad AI output | 0% |
| Auth flow (register → dashboard) | < 60 seconds |
| TypeScript `any` usage | 0 intentional instances |

---

## 3. User Personas

### Primary Persona — Active Job Seeker (Nikhil, 22)
- Applying to 10–30 jobs per week.
- Frustrated by copy-pasting the same info across spreadsheets.
- Wants quick status updates and resume tailoring without switching tools.

### Secondary Persona — Internship Hunter (Priya, 20)
- Less experienced, needs guidance on what skills to highlight per role.
- Relies heavily on AI suggestions to structure resume bullets.

---

## 4. User Stories

### Authentication
- As a new user, I can register with email and password so that I have a personal account.
- As a returning user, I can log in and my session persists after page refresh.
- As a logged-in user, I can access only my own applications; others cannot see mine.

### Kanban Board
- As a user, I see five columns: **Applied**, **Phone Screen**, **Interview**, **Offer**, **Rejected**.
- As a user, I can drag a card from one column to another to reflect my current stage.
- As a user, I see company name, role, date applied, and status on each card at a glance.
- As a user, I can click a card to open a full detail/edit view.

### AI Job Description Parser
- As a user, I can paste a raw job description and click **Parse** to auto-fill card fields.
- As a user, I see a loading indicator while the AI processes my input.
- As a user, I see a friendly error message if the AI fails or returns unexpected output.

### AI Resume Suggestions
- As a user, I receive 3–5 tailored resume bullet points after the JD is parsed.
- As a user, each bullet point has a **Copy** button for quick use.
- As a user, the suggestions are specific to the role and company, not generic.

### Application Management
- As a user, I can create, edit, and delete application cards at any time.
- As a user, I can add optional fields: JD link, salary range, notes.

---

## 5. Functional Requirements

### 5.1 Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | Register endpoint accepts `{ email, password }`, hashes password with bcrypt (≥10 rounds), stores user in MongoDB | P0 |
| AUTH-02 | Login endpoint validates credentials and returns a signed JWT (expiry: 7 days) | P0 |
| AUTH-03 | All protected API routes require `Authorization: Bearer <token>` header | P0 |
| AUTH-04 | Frontend persists JWT in memory (or `httpOnly` cookie); re-hydrates auth state on refresh | P0 |
| AUTH-05 | Expired/invalid JWT returns `401 Unauthorized` with a clear JSON error body | P0 |
| AUTH-06 | Passwords must be ≥ 8 characters (frontend + backend validation) | P1 |

### 5.2 Kanban Board

| ID | Requirement | Priority |
|----|-------------|----------|
| BOARD-01 | Board renders five columns: Applied, Phone Screen, Interview, Offer, Rejected | P0 |
| BOARD-02 | Cards are draggable between columns using a drag-and-drop library | P0 |
| BOARD-03 | Dropping a card in a new column updates `status` via PATCH API call | P0 |
| BOARD-04 | Each card displays: company name, role title, date applied, status badge | P0 |
| BOARD-05 | Board shows a styled empty state when no applications exist | P1 |
| BOARD-06 | Board shows skeleton loaders while fetching data | P1 |
| BOARD-07 | Column headers display a count of cards in that column | P2 |

### 5.3 AI Job Description Parser

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-01 | User pastes raw JD text into a textarea and clicks **Parse** | P0 |
| AI-02 | Backend sends JD to OpenAI with `response_format: { type: "json_object" }` | P0 |
| AI-03 | Extracted fields: `companyName`, `role`, `requiredSkills[]`, `niceToHaveSkills[]`, `seniority`, `location` | P0 |
| AI-04 | Extracted fields are used to pre-populate the new application form | P0 |
| AI-05 | Frontend shows a loading spinner/skeleton during AI call | P0 |
| AI-06 | If AI returns malformed JSON or missing fields, frontend shows an error toast and allows manual entry | P0 |
| AI-07 | AI logic lives in a dedicated service layer (`aiService.ts`), not inside route handlers | P0 |

### 5.4 AI Resume Suggestions

| ID | Requirement | Priority |
|----|-------------|----------|
| RESUME-01 | After successful parse, backend generates 3–5 resume bullet points tailored to the extracted role | P0 |
| RESUME-02 | Bullets reference specific skills, seniority, and company context from the parsed JD | P0 |
| RESUME-03 | Each bullet is displayed with a **Copy to Clipboard** button | P0 |
| RESUME-04 | Suggestions are displayed on the card detail view and on the add-application modal | P1 |

### 5.5 Application CRUD

| ID | Requirement | Priority |
|----|-------------|----------|
| CRUD-01 | Create application with fields: `company`, `role`, `jdLink`, `notes`, `dateApplied`, `status`, `salaryRange` (optional) | P0 |
| CRUD-02 | Edit any field on an existing application | P0 |
| CRUD-03 | Delete an application (with confirmation prompt) | P0 |
| CRUD-04 | All CRUD operations are user-scoped (users cannot modify others' applications) | P0 |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Security** | No API keys committed to source control. All secrets in `.env`. JWTs signed with a strong secret. |
| **TypeScript** | Strict mode enabled. No `any` type unless documented with a comment explaining why. Shared types in a `types/` package or `shared/` folder. |
| **Error Handling** | App must not crash on bad AI output, network errors, or invalid input. All async operations wrapped in try/catch. |
| **Environment** | All environment variables documented in `.env.example`. |
| **Performance** | Kanban board renders in under 1 second for ≤ 50 cards. AI parse call completes in ≤ 10 seconds under normal OpenAI latency. |
| **Responsiveness** | UI is usable on desktop (1280px+) and tablet (768px+). |
| **Accessibility** | All interactive elements are keyboard-navigable. Form inputs have associated labels. |
| **Code Quality** | Components are reusable and single-responsibility. No business logic in UI components. |

---

## 7. Data Models

### 7.1 User

```typescript
interface IUser {
  _id: ObjectId;
  email: string;              // unique, lowercase, trimmed
  passwordHash: string;       // bcrypt hash
  createdAt: Date;
  updatedAt: Date;
}
```

### 7.2 Application

```typescript
type ApplicationStatus =
  | 'Applied'
  | 'Phone Screen'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

interface IApplication {
  _id: ObjectId;
  userId: ObjectId;           // ref: User
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: Date;
  status: ApplicationStatus;
  salaryRange?: string;

  // AI-populated fields
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions: string[];

  createdAt: Date;
  updatedAt: Date;
}
```

### 7.3 AI Parse Response (OpenAI JSON Mode)

```typescript
interface ParsedJobDescription {
  companyName: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
  resumeSuggestions: string[];  // 3-5 bullets
}
```

---

## 8. API Endpoints

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user profile |

### Applications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/applications` | JWT | Get all applications for authenticated user |
| POST | `/api/applications` | JWT | Create new application |
| GET | `/api/applications/:id` | JWT | Get single application |
| PATCH | `/api/applications/:id` | JWT | Update application fields |
| DELETE | `/api/applications/:id` | JWT | Delete application |

### AI

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ai/parse` | JWT | Parse JD text, returns structured JSON + resume suggestions |

### Request / Response Shapes

**POST `/api/auth/register`**
```json
// Request
{ "email": "user@example.com", "password": "securepass123" }

// Response 201
{ "token": "<jwt>", "user": { "_id": "...", "email": "user@example.com" } }
```

**POST `/api/ai/parse`**
```json
// Request
{ "jobDescription": "<raw JD text>" }

// Response 200
{
  "companyName": "Acme Corp",
  "role": "Frontend Engineer",
  "requiredSkills": ["React", "TypeScript"],
  "niceToHaveSkills": ["GraphQL"],
  "seniority": "Mid-level",
  "location": "Remote",
  "resumeSuggestions": [
    "Built reusable React component libraries reducing dev time by 30%...",
    "..."
  ]
}
```

---

## 9. UI/UX Specifications

### 9.1 Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingPage` | Marketing/login redirect. If authenticated, redirect to `/board`. |
| `/register` | `RegisterPage` | Email + password form |
| `/login` | `LoginPage` | Email + password form |
| `/board` | `BoardPage` | Main Kanban board (protected) |
| `/applications/:id` | `ApplicationDetailPage` | Full view/edit of a single card (protected) |

### 9.2 Key Components

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── board/
│   │   ├── KanbanBoard.tsx        ← container
│   │   ├── KanbanColumn.tsx       ← single column
│   │   └── ApplicationCard.tsx    ← draggable card
│   ├── application/
│   │   ├── AddApplicationModal.tsx
│   │   ├── ApplicationDetailView.tsx
│   │   ├── ApplicationForm.tsx
│   │   └── ResumeSuggestions.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       ├── Modal.tsx
│       ├── Spinner.tsx
│       ├── Toast.tsx
│       └── SkeletonCard.tsx
```

### 9.3 Application Card Design

```
┌─────────────────────────────────┐
│  Acme Corp               [Edit] │
│  ─────────────────────────────  │
│  Senior Frontend Engineer       │
│  Remote · Mid-level             │
│  📅 Applied: Apr 10, 2026       │
│  🏷️  [React] [TypeScript]       │
└─────────────────────────────────┘
```

### 9.4 Add Application Modal Flow

```
Step 1: Paste JD
┌──────────────────────────────────────┐
│  Add New Application                  │
│                                       │
│  ┌────────────────────────────────┐   │
│  │ Paste job description here...  │   │
│  └────────────────────────────────┘   │
│  [Parse with AI] or [Fill Manually]   │
└──────────────────────────────────────┘

Step 2: AI populates fields
┌──────────────────────────────────────┐
│  Company: [Acme Corp          ]       │
│  Role:    [Frontend Engineer  ]       │
│  Location:[Remote             ]       │
│  Skills:  React, TypeScript (editable)│
│  ...                                  │
│  💡 Resume Suggestions                │
│  • Built reusable... [Copy]           │
│  • Reduced bundle... [Copy]           │
│  [Save Application]                   │
└──────────────────────────────────────┘
```

### 9.5 State Handling Requirements

| State | Required UI |
|-------|-------------|
| Loading (initial board) | Skeleton cards in all 5 columns |
| Loading (AI parse) | Spinner on Parse button + disabled state |
| Empty board | Illustrated empty state with "Add Your First Application" CTA |
| Empty column | Subtle dashed placeholder with column name |
| API error | Toast notification with specific message |
| AI parse failure | Inline error under textarea; form remains editable |
| Delete confirm | Confirmation dialog before irreversible delete |

---

## 10. Stretch Goals (Post-Core)

| Feature | Effort | Value |
|---------|--------|-------|
| Streaming AI responses (SSE) | Medium | High — improves perceived speed |
| Dashboard with stats (pipeline funnel, response rate) | Medium | High |
| Follow-up reminders with overdue highlights | Medium | High |
| Search and filter on Kanban board | Low | Medium |
| Export to CSV | Low | Medium |
| Dark mode | Low | Medium |

---

## 11. Out of Scope (v1)

- Multi-user collaboration / shared boards
- Email notifications
- OAuth (Google/GitHub login)
- Mobile app (iOS/Android)
- Resume file upload and parsing

---

## 12. Constraints & Assumptions

- **OpenAI API key** is provided by the developer. The application uses `gpt-4o-mini` by default for cost efficiency; configurable via env.
- **Rate limiting** on the `/api/ai/parse` endpoint is not required for v1 but should be noted as a future need.
- **MongoDB Atlas** free tier is sufficient for development and demo purposes.
- **Deployment is optional** but the app must run locally via `npm run dev` in both `client/` and `server/` directories.
- Users are assumed to have modern browsers (Chrome 110+, Firefox 110+, Safari 16+).

---

## 13. Acceptance Criteria Summary

| Feature | Acceptance Criteria |
|---------|---------------------|
| Register | New user can register, receive JWT, and land on Kanban board |
| Login | Existing user logs in; board persists after page refresh |
| Add Application (manual) | All required fields validate; card appears in "Applied" column |
| Add Application (AI) | JD pasted → Parse clicked → fields pre-filled → resume suggestions shown → card saved |
| Drag & Drop | Card dragged to new column → status updated in DB → persists after refresh |
| Edit | All card fields editable from detail view |
| Delete | Application deleted with confirmation; removed from board |
| AI error handling | App shows error message without crashing if OpenAI returns bad response |
| No hardcoded secrets | `grep -r "sk-" src/` returns no matches |

---

*Document prepared for intern evaluation. Core requirements must be completed before any stretch goals.*
