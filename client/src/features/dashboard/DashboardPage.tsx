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

const SkeletonCard = () => (
  <div className="skeleton h-32 rounded-2xl" />
);

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
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your financial overview
        </p>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isEmpty ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="text-5xl mb-4">📭</div>
          <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>No data yet</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Add your first transaction to see your financial summary.
          </p>
          <button
            onClick={() => navigate('/transactions/new')}
            className="mt-6 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            + Add Transaction
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="Balance"
              amount={summary?.balance ?? 0}
              color="var(--accent)"
              icon="💰"
            />
            <SummaryCard
              label="Total Income"
              amount={summary?.totalIncome ?? 0}
              color="var(--income)"
              icon="📈"
            />
            <SummaryCard
              label="Total Expenses"
              amount={summary?.totalExpenses ?? 0}
              color="var(--expense)"
              icon="📉"
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
                <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
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
                      innerRadius={50}
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
                    <Legend
                      wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '12px' }}
                    />
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
                <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Monthly Trends
                </h2>
                <div style={{ minWidth: '320px' }}>
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
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Recent Transactions
              </h2>
              <button
                onClick={() => navigate('/transactions')}
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
              >
                View All →
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
                    <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{ background: 'var(--bg-elevated)' }}
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
                          <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                            {formatDate(tx.date)}
                          </td>
                          <td className="px-6 py-4">
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
                          <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                            {tx.title}
                          </td>
                          <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                            {getCategoryEmoji(tx.category)} {tx.category}
                          </td>
                          <td
                            className="px-6 py-4 mono font-semibold"
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

/** Returns an emoji for a given category string */
const getCategoryEmoji = (category: string): string => {
  const map: Record<string, string> = {
    food: '🍔',
    transport: '🚌',
    housing: '🏠',
    health: '❤️',
    entertainment: '🎬',
    shopping: '🛍️',
    salary: '💼',
    freelance: '💻',
    investment: '📊',
    gift: '🎁',
    other: '📦',
  };
  return map[category.toLowerCase()] ?? '📦';
};

export default DashboardPage;
