/**
 * Tests for DashboardPage:
 * - Summary cards render with mocked data
 * - Charts render without crashing
 * - Loading skeleton shows while data is pending
 * - Empty state renders when no transactions exist
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../../client/src/features/dashboard/DashboardPage';

// Mock useSummary hook
vi.mock('../../client/src/hooks/useSummary', () => ({
  useSummary: vi.fn(),
}));

import { useSummary } from '../../client/src/hooks/useSummary';

const mockSummary = {
  totalIncome: 5000,
  totalExpenses: 2500,
  balance: 2500,
  expensesByCategory: [
    { category: 'Food', total: 500 },
    { category: 'Transport', total: 300 },
  ],
  monthlyTrends: [
    { month: '2025-10', income: 4000, expenses: 2000 },
    { month: '2025-11', income: 4500, expenses: 2200 },
    { month: '2025-12', income: 5000, expenses: 2500 },
    { month: '2026-01', income: 4800, expenses: 2300 },
    { month: '2026-02', income: 5100, expenses: 2600 },
    { month: '2026-03', income: 5000, expenses: 2500 },
  ],
};

const makeWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders summary cards with mocked data', async () => {
    (useSummary as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockSummary,
      isLoading: false,
      error: null,
    });

    render(<DashboardPage />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/5,000/)).toBeInTheDocument();
      expect(screen.getByText(/2,500/)).toBeInTheDocument();
    });
  });

  it('renders loading skeletons while data is pending', () => {
    (useSummary as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = render(<DashboardPage />, { wrapper: makeWrapper() });

    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });

  it('renders empty state when no transactions exist', async () => {
    (useSummary as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        expensesByCategory: [],
        monthlyTrends: [],
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardPage />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/no transactions/i)).toBeInTheDocument();
    });
  });
});
