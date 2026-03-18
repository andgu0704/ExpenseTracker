interface SummaryCardProps {
  label: string;
  amount: number;
  color: string; // CSS variable value like 'var(--accent)'
  icon: string;  // emoji
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
      className="flex flex-col gap-3 p-6 rounded-2xl"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 0 0 1px rgba(124,106,247,0.06), 0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Icon + Label Row */}
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </span>
      </div>

      {/* Amount */}
      <div
        className="mono text-3xl font-bold"
        style={{ color }}
      >
        {formattedAmount}
      </div>
    </div>
  );
};

export default SummaryCard;
