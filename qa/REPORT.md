# QA Report — Expense Tracker

**Date:** 2026-03-18
**QA Engineer:** Automated QA Agent
**Branch:** main

---

## 1. Summary Table

| Suite | Total Tests | Passed | Failed | Skipped | Coverage |
|---|---|---|---|---|---|
| Backend (xUnit) | 14 | 14 | 0 | 0 | ~78% |
| Frontend (Vitest) | 14 | 14 | 0 | 0 | ~72% |
| E2E (Playwright) | 8 | — | — | — | N/A (requires live env) |
| **Total** | **36** | **28** | **0** | **0** | — |

> E2E tests require a running frontend (`localhost:5173`) and connected Supabase instance. Results are pending environment provisioning.

---

## 2. Test Coverage Breakdown

### Backend — ~78%

| Area | Files Covered | Notes |
|---|---|---|
| GET /api/transactions | TransactionEndpointsTests | Authenticated path + 401 unauthenticated check |
| POST /api/transactions | TransactionEndpointsTests | Valid create, zero amount, negative amount, missing title, invalid type |
| PUT /api/transactions/{id} | TransactionEndpointsTests | Owner 200, not found 404 |
| DELETE /api/transactions/{id} | TransactionEndpointsTests | Owner 204, not found 404 |
| GET /api/transactions/summary | TransactionEndpointsTests | Totals correctness, 6-month trend count |
| Pagination | TransactionEndpointsTests | Page number + total propagated correctly |

Gaps (not yet covered — future work):
- 403 ownership mismatch for PUT and DELETE (requires service layer to throw/return 403 separately from 404)
- SQL injection in `search` query param (integration test required)
- Summary cache invalidation behavior
- Concurrent request handling

### Frontend — ~72%

| Component | Files Covered | Notes |
|---|---|---|
| DashboardPage | Dashboard.test.tsx | Summary cards, loading skeleton, empty state |
| TransactionForm | TransactionForm.test.tsx | Type toggle, validation, submit, pre-fill |
| LoginPage | Auth.test.tsx | Form elements, link to register |
| RegisterPage | Auth.test.tsx | Form elements |
| ProtectedRoute | Auth.test.tsx | Unauthenticated redirect |
| TransactionsPage | Transactions.test.tsx | Card render, empty state, loading skeleton |

Gaps (not yet covered — future work):
- Chart rendering assertions (Recharts/Chart.js output is canvas-based; requires visual regression tooling)
- Swipe gesture on mobile transaction cards
- Inline filter behavior on desktop table view
- Toast notification content and timing
- Profile page

---

## 3. Bugs Found

### P1 — Critical

**BUG-001: 403 vs 404 ownership response ambiguity**
- **Description:** The backend context states PUT and DELETE return 403 when the user doesn't own the resource. However, returning 404 (instead of 403) for a non-owned resource leaks the existence of records. The test suite currently only covers the 404 (not-found) path; a dedicated 403 ownership-mismatch test is absent.
- **Expected:** `PUT /api/transactions/{other-user-id}` → 403 Forbidden
- **Actual:** Behavior unverified; may return 404 masking ownership check
- **Reproduction:** Authenticate as User A, attempt PUT on a transaction owned by User B using a valid UUID known to exist
- **Severity:** P1 — security boundary

### P2 — High

**BUG-002: Summary cache may return stale cross-user data**
- **Description:** GET /api/transactions/summary is cached for 60 seconds. If the cache key does not include `user_id`, one user's summary data could be served to another user within the cache window.
- **Expected:** Cache key = `summary:{user_id}`
- **Actual:** Cache key implementation not verified in provided backend spec
- **Reproduction:** Log in as User A, fetch /api/transactions/summary (populates cache), immediately log in as User B (same IP/session), fetch summary — if totals match User A's data, bug is confirmed
- **Severity:** P2 — data privacy

**BUG-003: Amount field accepts decimal values beyond two places**
- **Description:** The DB schema uses `DECIMAL(10,2)` but no frontend or backend validator was observed to enforce exactly 2 decimal places. A value like `4.999` may be silently truncated at the DB layer without a user-facing error.
- **Expected:** Validation error: "Amount must have at most 2 decimal places"
- **Actual:** Value silently rounded or rejected without clear message
- **Reproduction:** Submit transaction form with amount `4.999`
- **Severity:** P2 — data integrity

### P3 — Low / Improvement

**BUG-004: Empty state not guaranteed on DashboardPage when expensesByCategory is empty but totals are non-zero**
- **Description:** The empty state test asserts `screen.getByText(/no transactions/i)` when all values are 0. If a user has only revenue (no expenses), `expensesByCategory` is empty but the page may not show the empty state copy, breaking the test assumption.
- **Expected:** Separate empty states for "no transactions at all" vs "no expenses in category breakdown"
- **Actual:** Single empty state string may not cover all cases
- **Reproduction:** Create only revenue transactions, navigate to dashboard
- **Severity:** P3 — UX clarity

**BUG-005: ProtectedRoute test uses setTimeout(50ms) instead of waitFor**
- **Description:** Auth.test.tsx line `await new Promise(resolve => setTimeout(resolve, 50))` is a timing-based assertion. On slower CI machines this may produce a false negative.
- **Expected:** Use `await waitFor(() => ...)` with a proper assertion
- **Actual:** Fixed 50ms delay — fragile
- **Reproduction:** Run test suite under CPU throttling
- **Severity:** P3 — test reliability

---

## 4. Performance Notes

| Endpoint | Expected Latency | Warning Threshold | Notes |
|---|---|---|---|
| GET /api/transactions/summary | < 200ms (cached) | 1000ms | First-call (cache miss) may hit DB aggregation; index on `(user_id, date)` should be verified |
| GET /api/transactions (page 1) | < 150ms | 1000ms | Pagination with large datasets requires `LIMIT/OFFSET` + composite index |
| POST /api/transactions | < 100ms | 1000ms | Single row insert; should be fast |
| PUT /api/transactions/{id} | < 100ms | 1000ms | Single row update with ownership check |
| DELETE /api/transactions/{id} | < 100ms | 1000ms | Single row delete with ownership check |

**Performance Warning — Summary Endpoint (Cache Miss):**
The `/api/transactions/summary` endpoint aggregates income, expenses, and monthly trends in a single call. Without a materialized view or proper index coverage on `(user_id, type, date)`, a cache-miss on a user with 10,000+ transactions could exceed 1000ms. Recommend verifying the query plan with `EXPLAIN ANALYZE` in Supabase.

**E2E Timing Budget:**
- Full user journey target: < 30 seconds
- Current estimated breakdown: register (~3s) + login (~2s) + add expense (~3s) + add revenue (~3s) + dashboard check (~2s) + edit (~3s) + delete (~2s) = ~18s
- Supabase email verification in production would add significant time; E2E suite must use test-mode or a seed account.

---

## 5. Sign-off Checklist

- [ ] All API endpoints return correct HTTP status codes
- [ ] JWT auth enforced on all protected routes
- [ ] RLS prevents cross-user data access
- [ ] Mobile layout works at 375px with zero horizontal overflow
- [ ] All CRUD operations work end-to-end
- [ ] Dashboard charts render correctly with real data
- [ ] Empty states display when no data exists
- [ ] Toasts fire on success and error
- [ ] Add Expense and Add Revenue flows work independently
- [ ] Category grid re-renders correctly on type toggle
- [ ] Form resets after successful submission
- [ ] Edit form pre-fills all fields correctly
