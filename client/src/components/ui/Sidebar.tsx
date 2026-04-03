import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const IconDashboard = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" fill={active ? 'currentColor' : 'none'} />
    <rect x="14" y="3" width="7" height="7" rx="1" fill={active ? 'currentColor' : 'none'} opacity="0.5" />
    <rect x="3" y="14" width="7" height="7" rx="1" fill={active ? 'currentColor' : 'none'} opacity="0.5" />
    <rect x="14" y="14" width="7" height="7" rx="1" fill={active ? 'currentColor' : 'none'} opacity="0.3" />
  </svg>
);

const IconTransactions = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" fill={active ? 'currentColor' : 'none'} />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LogoMark = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <rect width="30" height="30" rx="8" fill="var(--accent)" fillOpacity="0.15" />
    <path d="M8 15C8 11.134 11.134 8 15 8C18.866 8 22 11.134 22 15" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    <path d="M11 19.5L15 15.5L18 18.5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="15" cy="15.5" r="1.5" fill="var(--accent)" />
  </svg>
);

// ── Nav Items ──────────────────────────────────────────────────────────────────

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { to: '/transactions', label: 'Transactions', Icon: IconTransactions },
];

// ── Sidebar ────────────────────────────────────────────────────────────────────

const Sidebar = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const initial = email ? email[0].toUpperCase() : '?';

  return (
    <aside
      className="hidden md:flex flex-col h-screen sticky top-0 shrink-0"
      style={{
        width: '240px',
        background: 'rgba(17,17,24,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <LogoMark />
        <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          ExpenseTracker
        </span>
      </div>

      {/* New Transaction Button */}
      <div className="px-4 pb-4">
        <button
          onClick={() => navigate('/transactions/new')}
          className="btn-accent flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm"
        >
          <IconPlus />
          New Transaction
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0 16px 8px' }} />

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-1 space-y-0.5">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={({ isActive }) => ({
              background: isActive ? 'var(--accent-subtle)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              paddingLeft: isActive ? '10px' : '12px',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                  <Icon active={isActive} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-3 px-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: 'var(--accent-subtle)',
              border: '1.5px solid rgba(124,106,247,0.4)',
              color: 'var(--accent)',
            }}
          >
            {initial}
          </div>
          <p className="text-xs truncate flex-1" style={{ color: 'var(--text-secondary)' }}>
            {email ?? '—'}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--expense)';
            e.currentTarget.style.background = 'var(--expense-subtle)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <IconLogout />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
