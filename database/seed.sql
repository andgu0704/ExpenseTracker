-- ============================================================
-- SEED DATA — Sample Transactions
-- ============================================================
--
-- HOW TO USE:
--   1. Run schema.sql first to ensure the transactions table exists.
--   2. Replace ALL occurrences of the placeholder user_id below:
--        '00000000-0000-0000-0000-000000000001'
--      with a real user UUID from your auth.users table.
--      You can find your user UUID in Supabase:
--        Dashboard → Authentication → Users → copy the UUID
--   3. Run this file in the Supabase SQL Editor or via psql.
--
-- NOTE: RLS must be temporarily bypassed to insert seed data as a
-- service role, OR the session must be authenticated as the target
-- user. When running from the Supabase SQL Editor as the postgres
-- role (service role), RLS is bypassed automatically.
-- ============================================================

-- Replace this placeholder with your actual user UUID before running
-- Example: '3f6e4c12-89ab-4def-a012-3456789bcdef'
DO $$
DECLARE
  seed_user_id UUID := 'aa1f7a4c-f6c4-4c0d-b243-b4c7b70ae377';
BEGIN

  INSERT INTO transactions (user_id, type, title, amount, category, date, note) VALUES

    -- -------------------------------------------------------
    -- REVENUE — Salary
    -- -------------------------------------------------------
    (seed_user_id, 'revenue', 'Monthly Salary',        4500.00, 'Salary',      '2025-12-31', 'December salary from employer'),
    (seed_user_id, 'revenue', 'Monthly Salary',        4500.00, 'Salary',      '2026-01-31', 'January salary from employer'),
    (seed_user_id, 'revenue', 'Monthly Salary',        4500.00, 'Salary',      '2026-02-28', 'February salary from employer'),

    -- -------------------------------------------------------
    -- REVENUE — Freelance
    -- -------------------------------------------------------
    (seed_user_id, 'revenue', 'Freelance Web Project', 1200.00, 'Freelance',   '2026-01-15', 'Landing page redesign for client'),
    (seed_user_id, 'revenue', 'Consulting Session',     350.00, 'Freelance',   '2026-02-10', '2-hour strategy consulting call'),

    -- -------------------------------------------------------
    -- REVENUE — Investment
    -- -------------------------------------------------------
    (seed_user_id, 'revenue', 'Dividend Payout',        85.50, 'Investment',   '2026-03-01', 'Q1 dividend from index fund ETF'),

    -- -------------------------------------------------------
    -- EXPENSES — Food
    -- -------------------------------------------------------
    (seed_user_id, 'expense', 'Weekly Groceries',       95.40, 'Food',         '2025-12-20', 'Supermarket run — weekly groceries'),
    (seed_user_id, 'expense', 'Restaurant Dinner',      62.00, 'Food',         '2026-01-08', 'Dinner with friends at Italian bistro'),
    (seed_user_id, 'expense', 'Coffee & Lunch',         18.75, 'Food',         '2026-02-14', 'Valentines day lunch outing'),

    -- -------------------------------------------------------
    -- EXPENSES — Transport
    -- -------------------------------------------------------
    (seed_user_id, 'expense', 'Monthly Transit Pass',   90.00, 'Transport',    '2026-01-02', 'Public transit pass for January'),
    (seed_user_id, 'expense', 'Rideshare to Airport',   34.50, 'Transport',    '2026-03-05', 'Uber to airport for business trip'),

    -- -------------------------------------------------------
    -- EXPENSES — Housing
    -- -------------------------------------------------------
    (seed_user_id, 'expense', 'Monthly Rent',         1400.00, 'Housing',      '2026-01-01', 'Rent payment for January'),
    (seed_user_id, 'expense', 'Electricity Bill',       87.30, 'Housing',      '2026-02-05', 'Electricity bill for January usage'),

    -- -------------------------------------------------------
    -- EXPENSES — Health
    -- -------------------------------------------------------
    (seed_user_id, 'expense', 'Gym Membership',         45.00, 'Health',       '2026-02-01', 'Monthly gym subscription'),
    (seed_user_id, 'expense', 'Pharmacy',               23.60, 'Health',       '2026-03-12', 'Cold medicine and vitamins'),

    -- -------------------------------------------------------
    -- EXPENSES — Entertainment
    -- -------------------------------------------------------
    (seed_user_id, 'expense', 'Streaming Services',     28.97, 'Entertainment','2026-01-18', 'Netflix + Spotify monthly subscriptions'),

    -- -------------------------------------------------------
    -- EXPENSES — Shopping
    -- -------------------------------------------------------
    (seed_user_id, 'expense', 'Winter Jacket',         139.00, 'Shopping',     '2025-12-28', 'New jacket from winter sale'),
    (seed_user_id, 'expense', 'Tech Accessories',       55.99, 'Shopping',     '2026-03-18', 'USB hub and cable organiser');

END $$;
