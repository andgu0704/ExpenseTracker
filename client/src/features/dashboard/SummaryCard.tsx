// ── SVG icon components keyed by card type ──────────────────────────────────

const IconBalance = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const IconIncome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconExpense = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const iconMap: Record<string, React.ReactNode> = {
  balance: <IconBalance />,
  income: <IconIncome />,
  expense: <IconExpense />,
};

// ── Component ────────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  amount: number;
  color: string;
  icon: string; // 'balance' | 'income' | 'expense'
}

/**
 * Displays a single financial summary metric with icon, label, and formatted amount.
 */
const SummaryCard = ({ label, amount, color, icon }: SummaryCardProps) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);

  return (
    <div
      className="relative flex flex-col gap-4 pt-5 px-5 pb-5 rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 0 0 1px rgba(124,106,247,0.06), 0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />

      {/* Icon + Label */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, color }}
        >
          {iconMap[icon] ?? iconMap['balance']}
        </div>
      </div>

      {/* Amount */}
      <div
        className="mono text-3xl font-bold tracking-tight"
        style={{ color }}
      >
        {formattedAmount}
      </div>
    </div>
  );
};

export default SummaryCard;
