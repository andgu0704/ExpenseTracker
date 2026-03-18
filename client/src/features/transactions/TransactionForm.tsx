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
    // Auto-select first category of new type
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

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  };
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--accent)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--border)';
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-screen md:min-h-0">
      <div className="flex-1 space-y-6 pb-24 md:pb-0">
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
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all"
                style={{
                  background: active ? color : 'transparent',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  boxShadow: active ? `0 0 12px ${color}40` : 'none',
                }}
              >
                {t === 'expense' ? '📉 Expense' : '📈 Revenue'}
              </button>
            );
          })}
        </div>

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
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Amount
          </label>
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold"
              style={{ color: 'var(--text-secondary)' }}
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
              className="mono w-full pl-8 pr-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>

        {/* Category Grid (mobile) / Select (desktop) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Category
          </label>

          {/* Mobile: 4-col grid */}
          <div className="grid grid-cols-4 gap-2 md:hidden">
            {categories.map((cat) => {
              const isSelected = category === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium py-3 transition-all"
                  style={{
                    background: isSelected ? `${activeColor}20` : 'var(--bg-elevated)',
                    border: `1px solid ${isSelected ? activeColor : 'var(--border)'}`,
                    color: isSelected ? activeColor : 'var(--text-secondary)',
                    boxShadow: isSelected ? `0 0 12px ${activeColor}25` : 'none',
                    minHeight: '72px',
                  }}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="leading-tight text-center" style={{ fontSize: '10px' }}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop: styled select */}
          <div className="hidden md:block">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
              style={{
                ...inputStyle,
                cursor: 'pointer',
              }}
            >
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
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
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              ...inputStyle,
              colorScheme: 'dark',
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Note <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any extra details…"
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      {/* Sticky Bottom Bar (mobile) / Normal buttons (desktop) */}
      <div
        className="fixed bottom-0 left-0 right-0 flex gap-3 px-4 py-4 md:static md:flex md:pt-6"
        style={{
          background: 'var(--bg-base)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ background: activeColor, color: '#fff' }}
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
