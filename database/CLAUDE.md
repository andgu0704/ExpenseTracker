# CLAUDE.md — Database Architect

## Coding Style & Conventions
- Use snake_case for all table names, column names, and indexes
- All tables must have: id (UUID), created_at (TIMESTAMPTZ)
- Use ENUM types for fixed value sets (e.g. transaction_type)
- Always name constraints explicitly (e.g. fk_transactions_user_id)
- Add a comment on every column explaining its purpose
- Group SQL into sections: TYPES → TABLES → INDEXES → POLICIES

## Security Best Practices
- Enable Row Level Security (RLS) on every table — no exceptions
- Write separate RLS policies for SELECT, INSERT, UPDATE, DELETE
- Reference auth.users via FK with ON DELETE CASCADE
- Never store passwords, tokens, or secrets in any table
- Never expose internal user IDs in public-facing views

## Performance Rules
- Add indexes on: user_id, date, type, category
- Add a composite index on (user_id, date) for time-range queries
- Use DECIMAL(10,2) for all monetary values — never FLOAT
- Never use SELECT * in views or functions

## Documentation Standards
- README.md must explain every table, column, policy, and index
- Include an ASCII art schema diagram
- Document step-by-step how to run schema.sql and seed.sql
- Explain the RLS strategy and why it is safe
