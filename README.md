# ExpenseTracker — Personal Finance Tracker

A mobile-first personal finance tracker where users manually log expenses and revenues, view a dashboard with charts, and manage all transactions.

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend  | .NET 8 Minimal Web API (C#)            |
| Database | Supabase (PostgreSQL + Supabase Auth)   |

## Project Structure

```
ExpenseTracker/
├── database/          # SQL schema, seed data, docs
│   ├── schema.sql     # Table, indexes, RLS policies
│   ├── seed.sql       # 15+ sample transactions
│   ├── CLAUDE.md      # DB agent conventions
│   └── README.md      # Full database documentation
│
├── server/            # .NET 8 Minimal Web API
│   ├── Program.cs
│   ├── Endpoints/     # TransactionEndpoints.cs
│   ├── Data/          # Repository pattern (Dapper)
│   ├── Services/      # Business logic layer
│   ├── Models/        # DTOs and request models
│   ├── Validators/    # FluentValidation validators
│   ├── CLAUDE.md      # Backend agent conventions
│   └── README.md      # API documentation
│
├── client/            # React + Vite frontend
│   ├── src/
│   │   ├── features/  # dashboard, transactions, auth
│   │   ├── components/# Shared UI components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── lib/       # Axios client, Supabase client
│   │   └── types/     # TypeScript interfaces
│   ├── CLAUDE.md      # Frontend agent conventions
│   └── README.md      # Frontend documentation
│
├── qa/                # Tests and QA report
│   ├── backend/       # xUnit + Moq tests
│   ├── frontend/      # Vitest + React Testing Library
│   ├── e2e/           # Playwright E2E tests
│   ├── CLAUDE.md      # QA agent conventions
│   └── REPORT.md      # QA report with sign-off checklist
│
└── README.md          # This file
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [Supabase account](https://supabase.com/) with a project created

## Setup

### 1. Database

1. Open your Supabase project → SQL Editor
2. Run `/database/schema.sql` to create tables, indexes, and RLS policies
3. (Optional) Run `/database/seed.sql` — replace the placeholder `user_id` with a real UUID first:
   ```bash
   sed -i '' 's/00000000-0000-0000-0000-000000000001/YOUR_USER_UUID/g' database/seed.sql
   ```
4. See `/database/README.md` for full details

### 2. Backend

1. Copy your Supabase credentials into `/server/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=db.xxx.supabase.co;Database=postgres;Username=postgres;Password=YOUR_DB_PASSWORD;Port=5432;SSL Mode=Require"
     },
     "Supabase": {
       "Url": "https://xxx.supabase.co",
       "JwtSecret": "your_supabase_jwt_secret"
     },
     "Jwt": {
       "Issuer": "https://xxx.supabase.co/auth/v1",
       "Audience": "authenticated"
     }
   }
   ```
2. Run the backend:
   ```bash
   cd server
   dotnet run
   ```
3. API available at `http://localhost:5000` — Swagger at `http://localhost:5000/swagger`
4. See `/server/README.md` for full API documentation

### 3. Frontend

1. Copy `/client/.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:5000
   ```
2. Install dependencies and run:
   ```bash
   cd client
   npm install
   npm run dev
   ```
3. App available at `http://localhost:5173`
4. See `/client/README.md` for full frontend documentation

### 4. Running Tests

```bash
# Backend tests (xUnit)
cd qa/backend
dotnet test

# Frontend unit tests (Vitest)
cd qa/frontend
npm install
npm test

# E2E tests (Playwright) — requires running frontend + backend
cd qa/e2e
npm install
npx playwright install
npm test
```

See `/qa/REPORT.md` for the full QA report.

## Features

- **Auth**: Email/password via Supabase Auth — no passwords stored in your DB
- **Dashboard**: Balance, income, expenses summary cards + pie chart (by category) + bar chart (monthly trends)
- **Transactions**: Paginated list with search, type filter, and category filter
- **Add / Edit**: Full form with type toggle, category tile grid, date picker, and note field
- **Mobile-first**: Bottom nav, swipeable cards, responsive layouts at all breakpoints
- **Dark theme**: Consistent design system with CSS variables throughout

## API Endpoints

| Method | Path                        | Description                     |
|--------|-----------------------------|---------------------------------|
| GET    | /api/transactions           | Paginated, filterable list      |
| POST   | /api/transactions           | Create a transaction            |
| PUT    | /api/transactions/{id}      | Update (ownership verified)     |
| DELETE | /api/transactions/{id}      | Delete (ownership verified)     |
| GET    | /api/transactions/summary   | Dashboard aggregations (cached) |

All endpoints require a valid Supabase Bearer JWT.

## Security

- **RLS**: Every DB query is row-level security scoped — a user can only read/write their own data
- **JWT**: All API endpoints validate the Supabase JWT; `user_id` is always extracted from the token, never the request body
- **Ownership**: PUT and DELETE verify the requesting user owns the record before proceeding (returns 403 otherwise)
- **No localStorage**: Session tokens are managed by the Supabase SDK, never stored manually

## Built By

This monorepo was built by a coordinated team of 4 specialized AI agents:
- **Agent 1 — Database Architect**: Schema, indexes, RLS policies, seed data
- **Agent 2 — Backend Developer**: .NET 8 API with Repository Pattern, Dapper, FluentValidation
- **Agent 3 — Frontend Developer**: React + Vite + TanStack Query + Recharts + dark design system
- **Agent 4 — QA Engineer**: xUnit + Moq backend tests, Vitest + RTL frontend tests, Playwright E2E
