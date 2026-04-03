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

// ── Icon components ──────────────────────────────────────────────────────────

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// ── TransactionsPage ─────────────────────────────────────────────────────────

const TransactionsPage = () => {
  const navigate = useNavigate();
  const { mutateAsync: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | 'expense' | 'revenue'>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

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

  const applyFilters = useCallback(() => {
    setAllTransactions([]);
    setCurrentPage(1);
    setHasMore(true);
  }, []);

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

  const hasActiveFilters = search || typeFilter || categoryFilter;

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

        <div className="hidden md:flex gap-2">
          <button
            onClick={() => navigate('/transactions/new')}
            className="btn-accent flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          >
            <IconPlus />
            Add Transaction
          </button>
        </div>

        {/* Mobile: Filter button */}
        <button
          onClick={() => setShowFilterSheet(true)}
          className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
          style={{
            background: hasActiveFilters ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
            border: `1px solid ${hasActiveFilters ? 'rgba(124,106,247,0.3)' : 'var(--border)'}`,
            color: hasActiveFilters ? 'var(--accent)' : 'var(--text-primary)',
          }}
        >
          <IconFilter />
          {hasActiveFilters ? 'Filtered' : 'Filter'}
        </button>
      </div>

      {/* Desktop: Inline filter bar */}
      <div
        className="hidden md:flex gap-3 p-3 rounded-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {/* Search with icon */}
        <div className="flex-1 min-w-48 relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          >
            <IconSearch />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search transactions…"
            className="input-glow w-full pl-9 pr-4 py-2 rounded-xl text-sm"
            style={inputStyle}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => handleTypeChange(e.target.value as '' | 'expense' | 'revenue')}
          className="input-glow px-3 py-2 rounded-xl text-sm outline-none appearance-none cursor-pointer"
          style={inputStyle}
        >
          <option value="">All Types</option>
          <option value="expense">Expense</option>
          <option value="revenue">Revenue</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="input-glow px-3 py-2 rounded-xl text-sm outline-none appearance-none cursor-pointer"
          style={inputStyle}
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {getCategoryEmoji(c)} {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => { setSearch(''); setTypeFilter(''); setCategoryFilter(''); applyFilters(); }}
            className="px-3 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Clear
          </button>
        )}
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
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : allTransactions.length === 0 ? (
          <div className="p-14 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="13" y2="16" />
              </svg>
            </div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No transactions found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {hasActiveFilters
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
                        style={{ color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}
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
                      className="transition-colors group"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="px-2 py-1 rounded-lg text-xs font-semibold"
                          style={
                            tx.type === 'revenue'
                              ? { background: 'var(--income-subtle)', color: 'var(--income)' }
                              : { background: 'var(--expense-subtle)', color: 'var(--expense)' }
                          }
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium max-w-xs truncate" style={{ color: 'var(--text-primary)' }}>
                        {tx.title}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {getCategoryEmoji(tx.category)} {tx.category}
                      </td>
                      <td
                        className="px-5 py-3.5 mono font-semibold whitespace-nowrap"
                        style={{ color: tx.type === 'revenue' ? 'var(--income)' : 'var(--expense)' }}
                      >
                        {tx.type === 'revenue' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                        {tx.note ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/transactions/edit/${tx.id}`)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,106,247,0.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-subtle)'; }}
                          >
                            <IconEdit />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            disabled={isDeleting}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            style={{ background: 'var(--expense-subtle)', color: 'var(--expense)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--expense-subtle)'; }}
                          >
                            <IconTrash />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Infinite scroll sentinel */}
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
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowFilterSheet(false)}
        >
          <div
            className="rounded-t-3xl p-6 space-y-5"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderBottom: 'none',
              maxHeight: '82vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Filters</h3>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-lg font-medium"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Search
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                  <IconSearch />
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search transactions…"
                  className="input-glow w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Type Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Type
              </label>
              <div className="flex gap-2">
                {[
                  { value: '', label: 'All' },
                  { value: 'expense', label: 'Expense' },
                  { value: 'revenue', label: 'Revenue' },
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
                className="input-glow w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
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
              onClick={() => { applyFilters(); setShowFilterSheet(false); }}
              className="btn-accent w-full py-3 rounded-xl text-sm"
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
