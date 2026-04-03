// Profile page — shows current user info and provides logout action
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    navigate('/login');
  };

  const initial = email ? email[0].toUpperCase() : '?';

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Manage your account
        </p>
      </div>

      {/* Profile Card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 0 0 1px rgba(124,106,247,0.06), 0 4px 24px rgba(0,0,0,0.4)',
          maxWidth: '440px',
        }}
      >
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
            style={{
              background: 'var(--accent-subtle)',
              border: '2px solid rgba(124,106,247,0.4)',
              color: 'var(--accent)',
              boxShadow: '0 0 20px rgba(124,106,247,0.15)',
            }}
          >
            {initial}
          </div>
          <div>
            <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {email ? email.split('@')[0] : '—'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Personal account
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />

        {/* Email field */}
        <div className="space-y-1.5 mb-6">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            <IconMail />
            Email Address
          </label>
          <div
            className="w-full px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {email ?? '—'}
          </div>
        </div>

        {/* Sign out button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-50"
          style={{
            background: 'var(--expense-subtle)',
            border: '1px solid rgba(248,113,113,0.2)',
            color: 'var(--expense)',
          }}
          onMouseEnter={(e) => {
            if (!isLoggingOut) e.currentTarget.style.background = 'rgba(248,113,113,0.16)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--expense-subtle)';
          }}
        >
          <IconLogout />
          {isLoggingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
