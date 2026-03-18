/**
 * Custom hook for fetching the financial summary (totals, charts data).
 * Data is cached for 60 seconds matching the backend cache TTL.
 */
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { SummaryData } from '../types';

export const useSummary = () => {
  return useQuery({
    queryKey: ['summary'],
    queryFn: async () => {
      const { data } = await api.get<SummaryData>('/transactions/summary');
      return data;
    },
    staleTime: 60_000,
  });
};
