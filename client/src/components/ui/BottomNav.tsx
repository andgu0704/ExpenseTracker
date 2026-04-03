import { NavLink, useNavigate } from 'react-router-dom';

// ── SVG Icons ──────────────────────────────────────────────────────────────────

const IconDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconTransactions = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

const IconProfile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconPlus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ── BottomNav ──────────────────────────────────────────────────────────────────

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 py-2 z-50"
      style={{
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <NavLink
        to="/dashboard"
        className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors"
        style={({ isActive }) => ({
          color: isActive ? 'var(--accent)' : 'var(--text-muted)',
        })}
      >
        <IconDashboard />
        <span className="text-xs font-medium">Dashboard</span>
      </NavLink>

      <NavLink
        to="/transactions"
        end
        className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors"
        style={({ isActive }) => ({
          color: isActive ? 'var(--accent)' : 'var(--text-muted)',
        })}
      >
        <IconTransactions />
        <span className="text-xs font-medium">Transactions</span>
      </NavLink>

      {/* Center Add Button */}
      <button
        onClick={() => navigate('/transactions/new')}
        className="pulse-glow flex items-center justify-center rounded-full transition-transform active:scale-90"
        style={{
          width: '50px',
          height: '50px',
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
          color: '#fff',
          marginTop: '-10px',
        }}
        aria-label="New transaction"
      >
        <IconPlus />
      </button>

      <NavLink
        to="/profile"
        className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors"
        style={({ isActive }) => ({
          color: isActive ? 'var(--accent)' : 'var(--text-muted)',
        })}
      >
        <IconProfile />
        <span className="text-xs font-medium">Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
