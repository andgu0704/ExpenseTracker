# Database — Expense Tracker

This directory contains the complete database schema, seed data, and documentation for the Expense Tracker personal finance app, built on **Supabase (PostgreSQL)**.

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [ASCII Art Diagram](#ascii-art-diagram)
3. [Column Reference](#column-reference)
4. [Index Strategy](#index-strategy)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Running schema.sql in Supabase](#running-schemasql-in-supabase)
7. [Running seed.sql in Supabase](#running-seedsql-in-supabase)
8. [Replacing the Seed User ID](#replacing-the-seed-user-id)

---

## Schema Overview

The schema consists of a single application table — `transactions` — that belongs to Supabase's built-in `auth.users` table.

| Object              | Type   | Purpose                                               |
|---------------------|--------|-------------------------------------------------------|
| `transaction_type`  | ENUM   | Constrains `type` to `'expense'` or `'revenue'`       |
| `transactions`      | TABLE  | Stores every income and expense entry for every user  |
| 5 indexes           | INDEX  | Optimise the most common query patterns               |
| 4 RLS policies      | POLICY | Ensure each user can only access their own rows       |

---

## ASCII Art Diagram

```
┌─────────────────────────────────────┐
│           auth.users                │
│─────────────────────────────────────│
│  id  UUID  (PK)                     │
│  email, encrypted_password, ...     │
│  (managed by Supabase Auth)         │
└──────────────────┬──────────────────┘
                   │  1
                   │  auth.users.id
                   │  referenced by
                   │  transactions.user_id
                   │  ON DELETE CASCADE
                   │  n
┌──────────────────▼──────────────────┐
│           transactions              │
│─────────────────────────────────────│
│  id          UUID        PK         │
│  user_id     UUID        FK → auth  │
│  type        ENUM        expense /  │
│                          revenue    │
│  title       TEXT        NOT NULL   │
│  amount      DECIMAL(10,2) > 0      │
│  category    TEXT        NOT NULL   │
│  date        DATE        NOT NULL   │
│  note        TEXT        nullable   │
│  created_at  TIMESTAMPTZ auto-now   │
└─────────────────────────────────────┘

Indexes
───────
  idx_transactions_user_id    → (user_id)
  idx_transactions_date       → (date)
  idx_transactions_type       → (type)
  idx_transactions_category   → (category)
  idx_transactions_user_date  → (user_id, date)  ← composite

RLS Policies
────────────
  transactions_select  │ SELECT │ auth.uid() = user_id
  transactions_insert  │ INSERT │ auth.uid() = user_id
  transactions_update  │ UPDATE │ auth.uid() = user_id
  transactions_delete  │ DELETE │ auth.uid() = user_id
```

---

## Column Reference

| Column       | Type              | Nullable | Default                  | Description                                                       |
|--------------|-------------------|----------|--------------------------|-------------------------------------------------------------------|
| `id`         | UUID              | NO       | `gen_random_uuid()`      | Unique identifier for the transaction, auto-generated.            |
| `user_id`    | UUID              | NO       | —                        | FK to `auth.users.id`. Identifies the owner. Cascades on delete.  |
| `type`       | transaction_type  | NO       | —                        | Whether this is an `'expense'` or `'revenue'`. ENUM-enforced.     |
| `title`      | TEXT              | NO       | —                        | Short human-readable label (e.g. "Monthly Rent", "Salary").       |
| `amount`     | DECIMAL(10,2)     | NO       | —                        | Monetary value. Always positive. Fixed-point to avoid float drift. |
| `category`   | TEXT              | NO       | —                        | User-defined grouping (e.g. Food, Transport, Salary, Freelance).  |
| `date`       | DATE              | NO       | —                        | The date the transaction occurred — may differ from `created_at`. |
| `note`       | TEXT              | YES      | NULL                     | Optional free-form annotation provided by the user.               |
| `created_at` | TIMESTAMPTZ       | YES      | `now()`                  | Timestamp of row insertion. Set automatically by the database.    |

---

## Index Strategy

Five indexes are defined on the `transactions` table to cover the most common access patterns without over-indexing.

| Index Name                       | Columns              | Rationale                                                                         |
|----------------------------------|----------------------|-----------------------------------------------------------------------------------|
| `idx_transactions_user_id`       | `(user_id)`          | Every query filters by user. Without this, every query is a full table scan.      |
| `idx_transactions_date`          | `(date)`             | Date-range filters (e.g. "last 30 days") are extremely common in finance UIs.     |
| `idx_transactions_type`          | `(type)`             | Toggling between expense/revenue views is a core feature; avoids per-row checks.  |
| `idx_transactions_category`      | `(category)`         | Category breakdowns and summaries are frequent aggregation queries.               |
| `idx_transactions_user_date`     | `(user_id, date)`    | Composite index for the single most common pattern: user's transactions by date.  |

**Why DECIMAL(10,2) and not FLOAT?**
Floating-point arithmetic is inherently imprecise (e.g. `0.1 + 0.2 ≠ 0.3` in IEEE 754). Financial data must be exact. `DECIMAL(10,2)` stores values as exact fixed-point numbers, supports up to 99,999,999.99, and never introduces rounding errors.

---

## Row Level Security (RLS)

### What is RLS?

Row Level Security is a PostgreSQL feature that attaches access-control predicates directly to the table. Every query — regardless of which application code, API client, or Supabase client issues it — is automatically filtered by these predicates. It is enforced at the database engine level, meaning it cannot be bypassed by application bugs.

### Why this strategy is safe

1. **RLS is enabled unconditionally.** The `ALTER TABLE transactions ENABLE ROW LEVEL SECURITY` statement ensures no row is accessible unless a matching policy allows it. Without a policy, access is implicitly denied.

2. **Each policy checks `auth.uid() = user_id`.** Supabase's `auth.uid()` function reads the JWT claim of the currently authenticated session. A user cannot forge a different `uid` without a valid signed JWT from Supabase Auth.

3. **Separate policies per operation.** SELECT, INSERT, UPDATE, and DELETE are governed independently. This prevents, for example, a write-only API from leaking read access.

4. **CASCADE on delete.** When a user is deleted from `auth.users`, all their transactions are automatically removed. No orphaned rows are left behind.

5. **No service-role bypass in the app.** The application uses the `anon` or `authenticated` Supabase role (not `service_role`). Only admin tooling (migrations, seed scripts) uses the service role — and only temporarily.

### Policy Summary

| Policy Name              | Operation | Predicate                    |
|--------------------------|-----------|------------------------------|
| `transactions_select`    | SELECT    | `auth.uid() = user_id`       |
| `transactions_insert`    | INSERT    | `auth.uid() = user_id`       |
| `transactions_update`    | UPDATE    | `auth.uid() = user_id`       |
| `transactions_delete`    | DELETE    | `auth.uid() = user_id`       |

---

## Running schema.sql in Supabase

### Option A — Supabase SQL Editor (recommended for beginners)

1. Open your project at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. In the left sidebar, click **SQL Editor**.
3. Click **+ New query**.
4. Open `database/schema.sql` from this repository and paste its entire contents into the editor.
5. Click **Run** (or press `Cmd+Enter` / `Ctrl+Enter`).
6. You should see: `Success. No rows returned.`
7. Verify the table exists: in the left sidebar click **Table Editor** and confirm `transactions` appears.

### Option B — Supabase CLI (recommended for teams)

```bash
# 1. Install the Supabase CLI if not already installed
brew install supabase/tap/supabase

# 2. Log in
supabase login

# 3. Link to your project (find your project ref in Dashboard → Settings → General)
supabase link --project-ref YOUR_PROJECT_REF

# 4. Push the schema as a migration
supabase db push < database/schema.sql
```

### Option C — psql (direct connection)

```bash
# Find your connection string in Dashboard → Settings → Database → Connection string (URI)
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f database/schema.sql
```

---

## Running seed.sql in Supabase

> **Important:** Run `schema.sql` before `seed.sql`. The `transactions` table must exist first.

> **Important:** Replace the placeholder `user_id` before running. See the next section.

### Option A — Supabase SQL Editor

1. Open `database/seed.sql` and replace the placeholder user UUID (see below).
2. Open the SQL Editor in the Supabase Dashboard.
3. Paste the modified contents of `seed.sql` and click **Run**.
4. Verify: click **Table Editor → transactions** and confirm 18 rows are present.

### Option B — psql

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f database/seed.sql
```

---

## Replacing the Seed User ID

The seed file uses the placeholder UUID `00000000-0000-0000-0000-000000000001` as a stand-in for a real user. You must replace this before running the seed.

### Step 1 — Find your user UUID

1. Go to the Supabase Dashboard.
2. Click **Authentication** in the left sidebar.
3. Click **Users**.
4. Copy the UUID of the user you want to seed data for.

### Step 2 — Replace in the file

Open `database/seed.sql` and change this line:

```sql
seed_user_id UUID := '00000000-0000-0000-0000-000000000001';
```

To:

```sql
seed_user_id UUID := 'your-actual-user-uuid-here';
```

### Step 3 — Using sed for a quick substitution

```bash
sed -i '' \
  "s/00000000-0000-0000-0000-000000000001/your-actual-user-uuid-here/g" \
  database/seed.sql
```

### Step 4 — Run seed.sql

Follow the instructions in the previous section.

---

*This schema is intentionally minimal and purpose-built for a personal finance tracker. It is designed to be extended — for example, by adding a `budgets` table or a `recurring_transactions` table — without requiring changes to the core `transactions` structure.*
