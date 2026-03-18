# ExpenseTracker — Frontend Client

A dark-minimal fintech React + Vite + TypeScript frontend for tracking personal expenses and revenue. Inspired by Linear, Vercel Dashboard, and Stripe — clean, intentional, purposeful.

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- A running backend API (see `/server` directory) at `http://localhost:5000`
- A Supabase project (for authentication)

---

## Environment Setup

Copy `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:5000
```

---

## How to Run

```bash
cd client
npm install
npm run dev
```

App will be available at **http://localhost:5173**

### Available Scripts

| Command         | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Start development server (port 5173) |
| `npm run build` | Type-check + production build        |
| `npm run preview` | Preview production build           |
| `npm test`      | Run unit tests with Vitest           |

---

## Folder Structure

```
client/
├── index.html                  # Entry HTML with Google Fonts imports
├── vite.config.ts              # Vite + Vitest config
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
└── src/
    ├── main.tsx                # App bootstrap (QueryClient, Router, Toaster)
    ├── App.tsx                 # Route definitions (lazy-loaded pages)
    ├── index.css               # Global styles + CSS design tokens
    ├── types/
    │   └── index.ts            # TypeScript interfaces for all API types
    ├── lib/
    │   ├── supabase.ts         # Supabase client singleton
    │   └── api.ts              # Axios instance with JWT injection + 401 redirect
    ├── hooks/
    │   ├── useTransactions.ts       # TanStack Query hook for paginated transactions
    │   ├── useSummary.ts            # TanStack Query hook for financial summary
    │   └── useTransactionMutations.ts  # Create / update / delete mutations
    ├── components/
    │   └── ui/
    │       ├── Layout.tsx      # Responsive layout wrapper (Sidebar + BottomNav)
    │       ├── Sidebar.tsx     # Desktop sidebar with nav links + logout
    │       └── BottomNav.tsx   # Mobile bottom navigation with center + button
    ├── features/
    │   ├── auth/
    │   │   ├── ProtectedRoute.tsx   # Route guard — redirects to /login if no session
    │   │   ├── LoginPage.tsx        # Email + password login form
    │   │   ├── RegisterPage.tsx     # Sign-up form with email confirmation flow
    │   │   └── ProfilePage.tsx      # User profile card with logout
    │   ├── dashboard/
    │   │   ├── DashboardPage.tsx    # Full overview: cards, charts, recent transactions
    │   │   └── SummaryCard.tsx      # Reusable metric card (balance / income / expenses)
    │   └── transactions/
    │       ├── TransactionsPage.tsx    # Paginated list with filters + infinite scroll
    │       ├── TransactionCard.tsx     # Mobile swipeable card with edit/delete reveal
    │       ├── TransactionForm.tsx     # Shared add/edit form with category grid
    │       ├── AddTransactionPage.tsx  # New transaction page
    │       └── EditTransactionPage.tsx # Edit existing transaction page
    └── test/
        └── setup.ts            # Vitest + Testing Library setup
```

---

## Pages & Features

### `/login` — Login Page
- Centered card on dark full-screen background
- Email + password fields with focus accent border
- Error display on auth failure
- Link to register page
- On success: redirects to `/dashboard`

### `/register` — Register Page
- Same card layout as login
- Email + password + confirm password
- Client-side validation (password match, min length)
- On success: shows "Check your email" confirmation
- Link back to login

### `/dashboard` — Dashboard
- 3 summary cards: Balance (accent), Total Income (green), Total Expenses (red)
- Pie chart — expenses broken down by category
- Bar chart — last 6 months income vs expenses comparison
- Recent 5 transactions list (mobile cards / desktop table)
- "View All" button to navigate to `/transactions`
- Full loading skeletons while data fetches
- Empty state with CTA when no data

### `/transactions` — Transactions List
- Mobile: filter bottom sheet with search, type toggle, category select
- Mobile: swipeable transaction cards (swipe left to reveal Edit / Delete)
- Mobile: infinite scroll with IntersectionObserver
- Desktop: inline filter bar (search + type dropdown + category dropdown)
- Desktop: full data table with Edit / Delete action buttons
- "Add Expense" and "Add Revenue" buttons (desktop)

### `/transactions/new` — Add Transaction
- Type toggle pill: Expense / Revenue
- Title + Amount inputs
- Category grid (4 columns mobile, select on desktop)
  - Expense: Food, Transport, Housing, Health, Entertainment, Shopping, Other
  - Revenue: Salary, Freelance, Investment, Gift, Other
- Date picker (defaults to today)
- Optional note textarea
- Sticky bottom action bar (mobile)
- On success: toast + redirect to `/transactions`

### `/transactions/edit/:id` — Edit Transaction
- Pre-fills all fields from existing transaction
- Same form layout as Add
- On success: toast + redirect to `/transactions`

### `/profile` — Profile Page
- User avatar placeholder + email from session
- Logout button — calls `supabase.auth.signOut()` → redirects to `/login`

---

## Design System

See `CLAUDE.md` for the full design system documentation including:
- CSS custom properties (color palette)
- Typography (Inter + JetBrains Mono)
- Spacing & border radius tokens
- Component patterns
