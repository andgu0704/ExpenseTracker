// Dashboard feature — financial overview with charts and recent transactions
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useSummary } from '../../hooks/useSummary';
import { useTransactions } from '../../hooks/useTransactions';
import SummaryCard from './SummaryCard';
import type { Transaction } from '../../types';

const PIE_COLORS = [
  'var(--accent)',
  'var(--expense)',
  'var(--income)',
  'var(--warning)',
  '#a78bfa',
  '#60a5fa',
  '#f472b6',
];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const todayLabel = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const SkeletonCard = () => (
  <div className="skeleton h-28 rounded-2xl" />
);

const getCategoryEmoji = (category: string): string => {
  const map: Record<string, string> = {
    food: '🍔', transport: '🚌', housing: '🏠', health: '❤️',
    entertainment: '🎬', shopping: '🛍️', salary: '💼', freelance: '💻',
    investment: '📊', gift: '🎁', other: '📦',
  };
  return map[category.toLowerCase()] ?? '📦';
};

// ── Icon components ──────────────────────────────────────────────────────────

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ── Dashboard ────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: summary, isLoading: summaryLoading } = useSummary();
  const { data: txData, isLoading: txLoading } = useTransactions({ page: 1 });

  const recentTransactions = useMemo<Transaction[]>(() => {
    if (!txData?.data) return [];
    return txData.data.slice(0, 5);
  }, [txData]);

  const isEmpty = !summaryLoading && summary && summary.totalIncome === 0 && summary.totalExpenses === 0;

  return (
    <div className="page-enter space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {getGreeting()} 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {todayLabel()}
          </p>
        </div>
        <button
          onClick={() => navigate('/transactions/new')}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold btn-accent"
        >
          <IconPlus />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : isEmpty ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 0 0 1px rgba(124,106,247,0.06), 0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--accent-subtle)', border: '1px solid rgba(124,106,247,0.2)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12V22H4V12" />
              <path d="M22 7H2v5h20V7z" />
              <path d="M12 22V7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
          <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>No data yet</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Add your first transaction to see your financial summary.
          </p>
          <button
            onClick={() => navigate('/transactions/new')}
            className="btn-accent mt-6 px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2"
          >
            <IconPlus />
            Add Transaction
          </button>
        </div>
      ) : (
        <>
          {/* Balance — hero card */}
          <div
            className="relative rounded-2xl p-6 overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 0 0 1px rgba(124,106,247,0.08), 0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Subtle glow bg */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 80% 50%, rgba(124,106,247,0.07) 0%, transparent 60%)',
              }}
            />
            <div className="relative flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Net Balance
              </span>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
            </div>
            <div className="mono text-4xl font-bold mt-2" style={{ color: 'var(--accent)' }}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(summary?.balance ?? 0)}
            </div>
            {/* Accent top bar */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
              style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }}
            />
          </div>

          {/* Income + Expense row */}
          <div className="grid grid-cols-2 gap-4">
            <SummaryCard
              label="Total Income"
              amount={summary?.totalIncome ?? 0}
              color="var(--income)"
              icon="income"
            />
            <SummaryCard
              label="Total Expenses"
              amount={summary?.totalExpenses ?? 0}
              color="var(--expense)"
              icon="expense"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart — Expenses by Category */}
            {summary && summary.expensesByCategory.length > 0 && (
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 0 0 1px rgba(124,106,247,0.06), 0 4px 24px rgba(0,0,0,0.4)',
                }}
              >
                <h2 className="font-semibold mb-5 text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  Expenses by Category
                </h2>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={summary.expensesByCategory}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={52}
                      paddingAngle={3}
                    >
                      {summary.expensesByCategory.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        color: 'var(--text-primary)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                    />
                    <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bar Chart — Monthly Trends */}
            {summary && summary.monthlyTrends.length > 0 && (
              <div
                className="p-6 rounded-2xl overflow-x-auto"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 0 0 1px rgba(124,106,247,0.06), 0 4px 24px rgba(0,0,0,0.4)',
                }}
              >
                <h2 className="font-semibold mb-5 text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  Monthly Trends
                </h2>
                <div style={{ minWidth: '300px' }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={summary.monthlyTrends}
                      margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${v / 1000 >= 1 ? (v / 1000).toFixed(0) + 'k' : v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          color: 'var(--text-primary)',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '13px',
                        }}
                        formatter={(value: number) => [formatCurrency(value)]}
                      />
                      <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '12px' }} />
                      <Bar dataKey="income" name="Income" fill="#34D399" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#F87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div
            className="rounded-2xl"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 0 0 1px rgba(124,106,247,0.06), 0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h2 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Recent Transactions
              </h2>
              <button
                onClick={() => navigate('/transactions')}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
              >
                View All
                <IconArrowRight />
              </button>
            </div>

            {txLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                No transactions yet.
              </div>
            ) : (
              <div>
                {/* Mobile cards */}
                <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                          style={{
                            background: tx.type === 'revenue' ? 'var(--income-subtle)' : 'var(--expense-subtle)',
                            border: `1px solid ${tx.type === 'revenue' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                          }}
                        >
                          {getCategoryEmoji(tx.category)}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tx.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {formatDate(tx.date)} · {tx.category}
                          </p>
                        </div>
                      </div>
                      <span
                        className="mono text-sm font-semibold"
                        style={{ color: tx.type === 'revenue' ? 'var(--income)' : 'var(--expense)' }}
                      >
                        {tx.type === 'revenue' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Date', 'Type', 'Title', 'Category', 'Amount'].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="transition-colors"
                          style={{ borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <td className="px-6 py-3.5" style={{ color: 'var(--text-secondary)' }}>
                            {formatDate(tx.date)}
                          </td>
                          <td className="px-6 py-3.5">
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
                          <td className="px-6 py-3.5 font-medium" style={{ color: 'var(--text-primary)' }}>
                            {tx.title}
                          </td>
                          <td className="px-6 py-3.5" style={{ color: 'var(--text-secondary)' }}>
                            {getCategoryEmoji(tx.category)} {tx.category}
                          </td>
                          <td
                            className="px-6 py-3.5 mono font-semibold"
                            style={{ color: tx.type === 'revenue' ? 'var(--income)' : 'var(--expense)' }}
                          >
                            {tx.type === 'revenue' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
