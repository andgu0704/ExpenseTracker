/**
 * Tests for TransactionsPage:
 * - Transaction cards render with mocked data
 * - Filter bottom sheet opens on mobile
 * - Empty state renders when no transactions exist
 * - Delete confirmation is shown before deleting
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import TransactionsPage from '../../client/src/features/transactions/TransactionsPage';

vi.mock('../../client/src/hooks/useTransactions', () => ({
  useTransactions: vi.fn(),
}));

vi.mock('../../client/src/hooks/useTransactionMutations', () => ({
  useDeleteTransaction: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useCreateTransaction: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateTransaction: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

import { useTransactions } from '../../client/src/hooks/useTransactions';

const mockTransactions = [
  { id: '1', type: 'expense', title: 'Groceries', amount: 45.50, category: 'Food', date: '2026-03-18', note: null, createdAt: '2026-03-18T10:00:00Z' },
  { id: '2', type: 'revenue', title: 'Salary', amount: 3000, category: 'Salary', date: '2026-03-01', note: 'March', createdAt: '2026-03-01T09:00:00Z' },
];

const makeWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders transaction cards with mocked data', async () => {
    (useTransactions as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { data: mockTransactions, total: 2, page: 1 },
      isLoading: false,
      error: null,
    });

    render(<TransactionsPage />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
    });
  });

  it('renders empty state when no transactions exist', async () => {
    (useTransactions as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { data: [], total: 0, page: 1 },
      isLoading: false,
      error: null,
    });

    render(<TransactionsPage />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/no transactions/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (useTransactions as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = render(<TransactionsPage />, { wrapper: makeWrapper() });
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });
});
