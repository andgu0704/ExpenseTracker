import { useRef, useState } from 'react';
import type { Transaction } from '../../types';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍔', transport: '🚌', housing: '🏠', health: '❤️',
  entertainment: '🎬', shopping: '🛍️', salary: '💼', freelance: '💻',
  investment: '📊', gift: '🎁', other: '📦',
};

const getCategoryEmoji = (category: string) =>
  CATEGORY_EMOJI[category.toLowerCase()] ?? '📦';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

/**
 * Mobile transaction card with swipe-left gesture to reveal edit/delete actions.
 */
const TransactionCard = ({ transaction, onEdit, onDelete }: TransactionCardProps) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const startXRef = useRef<number | null>(null);
  const ACTION_WIDTH = 130;

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const delta = startXRef.current - e.touches[0].clientX;
    setSwipeOffset(Math.max(0, Math.min(ACTION_WIDTH, delta)));
  };

  const handleTouchEnd = () => {
    startXRef.current = null;
    setSwipeOffset(swipeOffset > ACTION_WIDTH / 2 ? ACTION_WIDTH : 0);
  };

  const closeSwipe = () => setSwipeOffset(0);

  const { type, title, category, date, amount, note } = transaction;
  const isRevenue = type === 'revenue';
  const amountColor = isRevenue ? 'var(--income)' : 'var(--expense)';
  const iconBg = isRevenue ? 'var(--income-subtle)' : 'var(--expense-subtle)';
  const iconBorder = isRevenue ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)';

  return (
    <div className="relative overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Action Buttons (revealed on swipe) */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-stretch"
        style={{ width: `${ACTION_WIDTH}px` }}
      >
        <button
          onClick={() => { closeSwipe(); onEdit(transaction.id); }}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-xs font-semibold"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <IconEdit />
          Edit
        </button>
        <button
          onClick={() => { closeSwipe(); onDelete(transaction.id); }}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-xs font-semibold"
          style={{ background: 'var(--expense)', color: '#fff' }}
        >
          <IconTrash />
          Delete
        </button>
      </div>

      {/* Card Content */}
      <div
        className="flex items-center justify-between px-4 py-3.5 transition-transform duration-150"
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          background: 'var(--bg-surface)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Category icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
          >
            {getCategoryEmoji(category)}
          </div>

          {/* Title + Meta */}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                style={
                  isRevenue
                    ? { background: 'var(--income-subtle)', color: 'var(--income)' }
                    : { background: 'var(--expense-subtle)', color: 'var(--expense)' }
                }
              >
                {type}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {formatDate(date)}
              </span>
            </div>
            {note && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {note}
              </p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="shrink-0 ml-3 text-right">
          <span className="mono text-sm font-bold" style={{ color: amountColor }}>
            {isRevenue ? '+' : '-'}{formatCurrency(amount)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
