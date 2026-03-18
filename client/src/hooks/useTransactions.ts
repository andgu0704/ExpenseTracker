/**
 * Custom hook for fetching and managing paginated transactions.
 * Supports filtering by type, category, and search text.
 */
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { PagedResult, Transaction, TransactionFilters } from '../types';

export const useTransactions = (filters: TransactionFilters = {}) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.category) params.set('category', filters.category);
      if (filters.search) params.set('search', filters.search);
      if (filters.page) params.set('page', String(filters.page));
      const { data } = await api.get<PagedResult<Transaction>>(`/transactions?${params}`);
      return data;
    },
  });
};
