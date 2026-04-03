import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateTransactionRequest } from '../../types';

interface TransactionFormProps {
  defaultValues?: Partial<CreateTransactionRequest>;
  onSubmit: (data: CreateTransactionRequest) => Promise<void>;
  isLoading: boolean;
}

const EXPENSE_CATEGORIES = [
  { key: 'food', label: 'Food', emoji: '🍔' },
  { key: 'transport', label: 'Transport', emoji: '🚌' },
  { key: 'housing', label: 'Housing', emoji: '🏠' },
  { key: 'health', label: 'Health', emoji: '❤️' },
  { key: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { key: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { key: 'other', label: 'Other', emoji: '📦' },
];

const REVENUE_CATEGORIES = [
  { key: 'salary', label: 'Salary', emoji: '💼' },
  { key: 'freelance', label: 'Freelance', emoji: '💻' },
  { key: 'investment', label: 'Investment', emoji: '📊' },
  { key: 'gift', label: 'Gift', emoji: '🎁' },
  { key: 'other', label: 'Other', emoji: '📦' },
];

const todayStr = () => new Date().toISOString().split('T')[0];

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const IconExpense = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const IconRevenue = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

/**
 * Shared form component for creating and editing transactions.
 * Handles type-aware category grids, validation, and submit logic.
 */
const TransactionForm = ({ defaultValues, onSubmit, isLoading }: TransactionFormProps) => {
  const navigate = useNavigate();
  const [type, setType] = useState<'expense' | 'revenue'>(defaultValues?.type ?? 'expense');
  const [title, setTitle] = useState(defaultValues?.title ?? '');
  const [amount, setAmount] = useState(defaultValues?.amount?.toString() ?? '');
  const [category, setCategory] = useState(
    defaultValues?.category ?? EXPENSE_CATEGORIES[0].key
  );
  const [date, setDate] = useState(defaultValues?.date ?? todayStr());
  const [note, setNote] = useState(defaultValues?.note ?? '');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : REVENUE_CATEGORIES;

  const handleTypeChange = (newType: 'expense' | 'revenue') => {
    setType(newType);
    const cats = newType === 'expense' ? EXPENSE_CATEGORIES : REVENUE_CATEGORIES;
    setCategory(cats[0].key);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit({
      type,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
      note: note.trim() || undefined,
    });
  };

  const isExpense = type === 'expense';
  const activeColor = isExpense ? 'var(--expense)' : 'var(--income)';
  const activeSubtle = isExpense ? 'var(--expense-subtle)' : 'var(--income-subtle)';

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="space-y-5 pb-6">

        {/* Type Toggle Pill */}
        <div
          className="flex rounded-xl p-1"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {(['expense', 'revenue'] as const).map((t) => {
            const active = type === t;
            const color = t === 'expense' ? 'var(--expense)' : 'var(--income)';
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200"
                style={{
                  background: active ? color : 'transparent',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  boxShadow: active ? `0 0 16px ${color}35` : 'none',
                }}
              >
                {t === 'expense' ? <IconExpense /> : <IconRevenue />}
                {t === 'expense' ? 'Expense' : 'Revenue'}
              </button>
            );
          })}
        </div>

        {/* Desktop 2-col layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left column */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Coffee, Rent, Salary…"
                className="input-glow w-full px-4 py-3 rounded-xl text-sm"
                style={inputStyle}
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Amount
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-base pointer-events-none"
                  style={{ color: activeColor }}
                >
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="input-glow mono w-full pl-8 pr-4 py-3 rounded-xl text-lg font-bold"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="input-glow w-full px-4 py-3 rounded-xl text-sm"
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Category Grid */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const isSelected = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key)}
                      className="flex flex-col items-center justify-center gap-1 rounded-xl py-3 transition-all duration-150"
                      style={{
                        background: isSelected ? activeSubtle : 'var(--bg-elevated)',
                        border: `1px solid ${isSelected ? activeColor : 'var(--border)'}`,
                        color: isSelected ? activeColor : 'var(--text-secondary)',
                        boxShadow: isSelected ? `0 0 10px ${activeColor}20` : 'none',
                        minHeight: '68px',
                      }}
                    >
                      <span className="text-xl leading-none">{cat.emoji}</span>
                      <span className="leading-tight text-center font-medium" style={{ fontSize: '10px' }}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Note{' '}
                <span className="normal-case font-normal" style={{ color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any extra details…"
                rows={3}
                className="input-glow w-full px-4 py-3 rounded-xl text-sm resize-none"
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="flex gap-3 pt-5"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-50"
          style={{
            background: activeColor,
            color: '#fff',
            boxShadow: `0 4px 16px ${activeColor}40`,
          }}
        >
          {isLoading
            ? 'Saving…'
            : isExpense
            ? 'Save Expense'
            : 'Save Revenue'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
