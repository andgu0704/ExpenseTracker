export interface Transaction {
  id: string;
  user_id: string;
  type: 'expense' | 'revenue';
  title: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  created_at: string;
}

export interface TransactionDto {
  id: string;
  type: 'expense' | 'revenue';
  title: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  createdAt: string;
}

export interface CreateTransactionBody {
  type: 'expense' | 'revenue';
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
}

export interface SummaryDto {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: { category: string; total: number }[];
  monthlyTrends: { month: string; income: number; expenses: number }[];
}

export interface TransactionFilters {
  type?: string;
  category?: string;
  search?: string;
  page?: number;
}
