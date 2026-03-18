// Transactions feature — paginated list with filtering, search, and CRUD actions
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TransactionCard from './TransactionCard';
import { useTransactions } from '../../hooks/useTransactions';
import { useDeleteTransaction } from '../../hooks/useTransactionMutations';
import type { TransactionFilters, Transaction } from '../../types';

const CATEGORY_OPTIONS = [
  'food', 'transport', 'housing', 'health', 'entertainment',
  'shopping', 'salary', 'freelance', 'investment', 'gift', 'other',
];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍔', transport: '🚌', housing: '🏠', health: '❤️',
  entertainment: '🎬', shopping: '🛍️', salary: '💼', freelance: '💻',
  investment: '📊', gift: '🎁', other: '📦',
};

const getCategoryEmoji = (category: string) =>
  CATEGORY_EMOJI[category.toLowerCase()] ?? '📦';

const TransactionsPage = () => {
  const navigate = useNavigate();
  const { mutateAsync: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();

  // Filters state
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | 'expense' | 'revenue'>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // All loaded transactions for infinite scroll
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const activeFilters: TransactionFilters = {
    page: currentPage,
    ...(search && { search }),
    ...(typeFilter && { type: typeFilter }),
    ...(categoryFilter && { category: categoryFilter }),
  };

  const { data, isLoading, isFetching } = useTransactions(activeFilters);

  // Reset on filter changes
  const applyFilters = useCallback(() => {
    setAllTransactions([]);
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  // Accumulate pages for infinite scroll
  useEffect(() => {
    if (data?.data) {
      if (currentPage === 1) {
        setAllTransactions(data.data);
      } else {
        setAllTransactions((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.data.length > 0 && allTransactions.length + data.data.length < data.total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setCurrentPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted.');
      applyFilters();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilters();
  };

  const handleTypeChange = (value: '' | 'expense' | 'revenue') => {
    setTypeFilter(value);
    applyFilters();
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    applyFilters();
  };

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Transactions
          </h1>
          {data && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {data.total} total
            </p>
          )}
        </div>

        {/* Desktop: Add buttons */}
        <div className="hidden md:flex gap-3">
          <button
            onClick={() => navigate('/transactions/new')}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--expense)', border: '1px solid rgba(248,113,113,0.25)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; }}
          >
            + Add Expense
          </button>
          <button
            onClick={() => navigate('/transactions/new')}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--income)', border: '1px solid rgba(52,211,153,0.25)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(52,211,153,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)'; }}
          >
            + Add Revenue
          </button>
        </div>

        {/* Mobile: Filter button */}
        <button
          onClick={() => setShowFilterSheet(true)}
          className="md:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          🔍 Filter
        </button>
      </div>

      {/* Desktop: Inline filter bar */}
      <div className="hidden md:flex gap-3 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search transactions…"
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={inputStyle}
        />
        <select
          value={typeFilter}
          onChange={(e) => handleTypeChange(e.target.value as '' | 'expense' | 'revenue')}
          className="px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
          style={inputStyle}
        >
          <option value="">All Types</option>
          <option value="expense">Expense</option>
          <option value="revenue">Revenue</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
          style={inputStyle}
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {getCategoryEmoji(c)} {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction List */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 0 0 1px rgba(124,106,247,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {isLoading && currentPage === 1 ? (
          <div className="p-6 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : allTransactions.length === 0 ? (
          <div className="p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
            <div className="text-5xl mb-4">📭</div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No transactions found</p>
            <p className="text-sm mt-1">
              {search || typeFilter || categoryFilter
                ? 'Try adjusting your filters.'
                : 'Add your first transaction to get started.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: swipeable cards */}
            <div className="md:hidden">
              {allTransactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  onEdit={(id) => navigate(`/transactions/edit/${id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Date', 'Type', 'Title', 'Category', 'Amount', 'Note', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td className="px-5 py-3 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="px-2 py-1 rounded-lg text-xs font-semibold"
                          style={
                            tx.type === 'revenue'
                              ? { background: 'rgba(52,211,153,0.15)', color: 'var(--income)' }
                              : { background: 'rgba(248,113,113,0.15)', color: 'var(--expense)' }
                          }
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium max-w-xs truncate" style={{ color: 'var(--text-primary)' }}>
                        {tx.title}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                        {getCategoryEmoji(tx.category)} {tx.category}
                      </td>
                      <td
                        className="px-5 py-3 mono font-semibold whitespace-nowrap"
                        style={{ color: tx.type === 'revenue' ? 'var(--income)' : 'var(--expense)' }}
                      >
                        {tx.type === 'revenue' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-5 py-3 max-w-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {tx.note ?? '—'}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/transactions/edit/${tx.id}`)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            style={{ background: 'rgba(124,106,247,0.15)', color: 'var(--accent)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,106,247,0.25)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,106,247,0.15)'; }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            disabled={isDeleting}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--expense)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.25)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Infinite scroll loader sentinel */}
            <div ref={loaderRef} className="h-4" />
            {isFetching && currentPage > 1 && (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                Loading more…
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {showFilterSheet && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowFilterSheet(false)}
        >
          <div
            className="rounded-t-3xl p-6 space-y-5"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Filters</h3>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="text-2xl leading-none"
                style={{ color: 'var(--text-secondary)' }}
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Search
              </label>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions…"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>

            {/* Type Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Type
              </label>
              <div className="flex gap-2">
                {[
                  { value: '', label: 'All' },
                  { value: 'expense', label: '📉 Expense' },
                  { value: 'revenue', label: '📈 Revenue' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTypeFilter(value as '' | 'expense' | 'revenue')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      background: typeFilter === value ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: typeFilter === value ? '#fff' : 'var(--text-secondary)',
                      border: `1px solid ${typeFilter === value ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                style={inputStyle}
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {getCategoryEmoji(c)} {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply */}
            <button
              onClick={() => {
                applyFilters();
                setShowFilterSheet(false);
              }}
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
