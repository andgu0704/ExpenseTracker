export interface Transaction {
  id: string;
  type: 'expense' | 'revenue';
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface CreateTransactionRequest {
  type: 'expense' | 'revenue';
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface UpdateTransactionRequest extends CreateTransactionRequest {}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
}

export interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: { category: string; total: number }[];
  monthlyTrends: { month: string; income: number; expenses: number }[];
}

export interface TransactionFilters {
  type?: 'expense' | 'revenue';
  category?: string;
  search?: string;
  page?: number;
}
