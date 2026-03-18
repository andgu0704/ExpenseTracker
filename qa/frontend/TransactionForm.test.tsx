/**
 * Tests for TransactionForm:
 * - Type toggle switches category grid (expense vs revenue categories)
 * - All required fields validate on submit
 * - Successful submit calls onSubmit callback
 * - Amount rejects zero and negative values
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TransactionForm from '../../client/src/features/transactions/TransactionForm';

const makeDefaultValues = () => ({
  type: 'expense' as const,
  title: '',
  amount: 0,
  category: 'Food',
  date: '2026-03-18',
  note: '',
});

describe('TransactionForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('renders type toggle with Expense and Revenue options', () => {
    render(
      <MemoryRouter>
        <TransactionForm defaultValues={makeDefaultValues()} onSubmit={mockOnSubmit} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText(/expense/i)).toBeInTheDocument();
    expect(screen.getByText(/revenue/i)).toBeInTheDocument();
  });

  it('switches category grid when type toggle changes', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TransactionForm defaultValues={makeDefaultValues()} onSubmit={mockOnSubmit} isLoading={false} />
      </MemoryRouter>
    );

    // Initially shows expense categories
    expect(screen.getByText(/food/i)).toBeInTheDocument();

    // Switch to revenue
    await user.click(screen.getByText(/revenue/i));

    // Now shows revenue categories
    expect(screen.getByText(/salary/i)).toBeInTheDocument();
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TransactionForm
          defaultValues={{ type: 'expense', title: '', amount: 0, category: 'Food', date: '2026-03-18', note: '' }}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/title/i), 'Lunch');
    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), '12.50');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Lunch', amount: 12.5 })
      );
    });
  });

  it('does not call onSubmit when title is empty', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TransactionForm defaultValues={makeDefaultValues()} onSubmit={mockOnSubmit} isLoading={false} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('shows error when amount is zero', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TransactionForm
          defaultValues={{ type: 'expense', title: 'Test', amount: 0, category: 'Food', date: '2026-03-18', note: '' }}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
      </MemoryRouter>
    );

    // Amount field should show 0
    const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    expect(amountInput.value).toBe('0');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/amount must be greater than/i)).toBeInTheDocument();
    });
  });

  it('pre-fills form when editing an existing transaction', () => {
    const existingValues = {
      type: 'revenue' as const,
      title: 'Salary',
      amount: 3000,
      category: 'Salary',
      date: '2026-03-01',
      note: 'March salary',
    };

    render(
      <MemoryRouter>
        <TransactionForm defaultValues={existingValues} onSubmit={mockOnSubmit} isLoading={false} />
      </MemoryRouter>
    );

    expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toBe('Salary');
    expect((screen.getByLabelText(/amount/i) as HTMLInputElement).value).toBe('3000');
    expect((screen.getByLabelText(/note/i) as HTMLTextAreaElement).value).toBe('March salary');
  });
});
