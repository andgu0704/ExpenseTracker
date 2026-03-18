import { useRef, useState } from 'react';
import type { Transaction } from '../../types';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
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

const getCategoryEmoji = (category: string) =>
  CATEGORY_EMOJI[category.toLowerCase()] ?? '📦';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Mobile transaction card with swipe-left gesture to reveal edit/delete actions.
 */
const TransactionCard = ({ transaction, onEdit, onDelete }: TransactionCardProps) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const startXRef = useRef<number | null>(null);
  const ACTION_WIDTH = 140; // px — total width of action buttons

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const delta = startXRef.current - e.touches[0].clientX;
    const clamped = Math.max(0, Math.min(ACTION_WIDTH, delta));
    setSwipeOffset(clamped);
  };

  const handleTouchEnd = () => {
    startXRef.current = null;
    if (swipeOffset > ACTION_WIDTH / 2) {
      setSwipeOffset(ACTION_WIDTH);
    } else {
      setSwipeOffset(0);
    }
  };

  const closeSwipe = () => setSwipeOffset(0);

  const { type, title, category, date, amount, note } = transaction;
  const isRevenue = type === 'revenue';

  return (
    <div className="relative overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Action Buttons (revealed on swipe) */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center"
        style={{ width: `${ACTION_WIDTH}px` }}
      >
        <button
          onClick={() => { closeSwipe(); onEdit(transaction.id); }}
          className="flex-1 h-full flex items-center justify-center text-sm font-semibold"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => { closeSwipe(); onDelete(transaction.id); }}
          className="flex-1 h-full flex items-center justify-center text-sm font-semibold"
          style={{ background: 'var(--expense)', color: '#fff' }}
        >
          🗑 Del
        </button>
      </div>

      {/* Card Content */}
      <div
        className="flex items-center justify-between px-4 py-4 transition-transform"
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          background: 'var(--bg-surface)',
          cursor: swipeOffset > 0 ? 'grab' : 'default',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Category Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: 'var(--bg-elevated)' }}
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
                className="text-xs font-medium px-2 py-0.5 rounded-lg"
                style={
                  isRevenue
                    ? { background: 'rgba(52,211,153,0.15)', color: 'var(--income)' }
                    : { background: 'rgba(248,113,113,0.15)', color: 'var(--expense)' }
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
        <div className="shrink-0 ml-4 text-right">
          <span
            className="mono text-base font-bold"
            style={{ color: isRevenue ? 'var(--income)' : 'var(--expense)' }}
          >
            {isRevenue ? '+' : '-'}{formatCurrency(amount)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
