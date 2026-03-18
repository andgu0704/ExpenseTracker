# CLAUDE.md — Frontend Developer

## Design System (Dark Minimal Fintech — Godly.website inspired)
Inspired by top-tier fintech and SaaS designs: dark backgrounds, sharp
contrast, vivid accent colors, generous whitespace, data-first layouts.
Think Linear, Vercel, Stripe Dashboard — clean, intentional, purposeful.

### Color Palette (define as CSS variables in index.css)
--bg-base:        #0A0A0F   /* near-black page background        */
--bg-surface:     #111118   /* card and panel background         */
--bg-elevated:    #1A1A24   /* hover states, input fields        */
--border:         #2A2A38   /* subtle borders                    */
--text-primary:   #F0F0FF   /* headings, key values              */
--text-secondary: #8888AA   /* labels, captions                  */
--text-muted:     #44445A   /* placeholders, disabled states     */
--accent:         #7C6AF7   /* primary — violet-purple           */
--accent-hover:   #9B8CFF   /* hover state of accent             */
--income:         #34D399   /* emerald green for revenue         */
--expense:        #F87171   /* soft red for expenses             */
--warning:        #FBBF24   /* amber for neutral alerts          */

### Typography
Font: Inter (Google Fonts) — import in index.html
Also import: JetBrains Mono for all monetary amounts
Use font-variant-numeric: tabular-nums on all amount values

### Spacing & Shape
Base unit: 4px. Use multiples: 8, 12, 16, 24, 32, 48, 64
Card border-radius : 16px (panels), 12px (buttons), 8px (badges)
Card border        : 1px solid var(--border)
Card shadow        : 0 0 0 1px rgba(124,106,247,0.06),
                     0 4px 24px rgba(0,0,0,0.4)
Max content width  : 1200px centered
Page padding       : 16px mobile / 32px tablet / 48px desktop

### Component Patterns
[... full design system content ...]

## Coding Style & Conventions
Feature-based folder structure:
  /src/features/dashboard
  /src/features/transactions
  /src/features/auth
  /src/components/ui     ← shared reusable components
  /src/hooks             ← custom React hooks
  /src/lib               ← axios client, supabase client, utils
  /src/types             ← TypeScript interfaces for all API types
One component per file, PascalCase filenames
Custom hooks for all data fetching (useTransactions, useSummary etc.)
No inline styles — Tailwind classes + CSS variables only
Prefer const arrow functions for all components

## Security Best Practices
Never store JWT in localStorage — use Supabase session only
Handle API 401 → redirect to /login automatically
Protected route wrapper guards all authenticated pages
Never expose Supabase service role key in frontend env

## Performance Rules
React.lazy + Suspense for all page-level components (code splitting)
TanStack Query for all API calls (caching, background refetch, states)
@tanstack/react-virtual for long transaction lists
Recharts always wrapped in ResponsiveContainer
useMemo for summary calculations

## Documentation Standards
JSDoc comment on every custom hook and utility function
README.md: prerequisites, env setup, folder structure, run instructions,
page-by-page feature description
Each feature folder has a brief index comment
