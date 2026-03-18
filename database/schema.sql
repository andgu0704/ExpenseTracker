-- ============================================================
-- TYPES
-- ============================================================

-- Defines allowed transaction types to enforce data integrity
CREATE TYPE transaction_type AS ENUM ('expense', 'revenue');

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE transactions (
  -- Unique identifier for each transaction
  id         UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The authenticated user who owns this transaction
  user_id    UUID             NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Whether this is an expense or revenue
  type       transaction_type NOT NULL,
  -- Short descriptive title for the transaction
  title      TEXT             NOT NULL,
  -- Monetary amount — always positive, stored as fixed-point decimal
  amount     DECIMAL(10,2)    NOT NULL CHECK (amount > 0),
  -- User-defined category (e.g. Food, Salary, Housing)
  category   TEXT             NOT NULL,
  -- The date the transaction occurred (not necessarily created_at)
  date       DATE             NOT NULL,
  -- Optional freeform note about the transaction
  note       TEXT,
  -- Timestamp when the record was inserted
  created_at TIMESTAMPTZ      DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Fast lookup by user for all queries
CREATE INDEX idx_transactions_user_id   ON transactions(user_id);
-- Fast filtering and sorting by date
CREATE INDEX idx_transactions_date      ON transactions(date);
-- Fast filtering by transaction type
CREATE INDEX idx_transactions_type      ON transactions(type);
-- Fast filtering and grouping by category
CREATE INDEX idx_transactions_category  ON transactions(category);
-- Composite index for time-range queries per user (most common query pattern)
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);

-- ============================================================
-- POLICIES (Row Level Security)
-- ============================================================

-- Enable RLS — every row is private to its owner by default
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only SELECT their own transactions
CREATE POLICY "transactions_select" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only INSERT transactions for themselves
CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own transactions
CREATE POLICY "transactions_update" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only DELETE their own transactions
CREATE POLICY "transactions_delete" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
