# CLAUDE.md — QA Engineer

## Coding Style & Conventions
- Use AAA pattern in all tests: Arrange → Act → Assert
- One describe block per component or endpoint, one test per behavior
- Test filenames mirror source: TransactionEndpoints.test.cs, Dashboard.test.tsx
- Use factories/fixtures for test data — never hardcode magic values inline
- Mock all external dependencies (Supabase, API) at the boundary layer

## Security Test Requirements
- Always test unauthenticated requests return 401
- Always test authenticated users cannot access other users' data (403)
- Test amount field rejects zero and negative values
- Test SQL injection attempts in search param are safely handled
- Test JWT expiry causes redirect to /login on frontend

## Performance Rules
- Each unit test must complete in under 100ms
- E2E full user journey must complete in under 30 seconds
- Flag any API call over 1000ms as a performance warning in REPORT.md
- Parallelize backend and frontend test suites where possible

## Documentation Standards
- Every test file has a top comment explaining what it covers
- REPORT.md: summary table, bugs found, coverage %, perf notes,
  sign-off checklist
- Failed tests include: expected vs actual, reproduction steps, severity
