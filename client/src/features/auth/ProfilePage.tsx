// Profile page — shows current user's email and provides logout action
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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

  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      <div
        className="w-full max-w-sm p-8 rounded-2xl text-center space-y-6"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 0 0 1px rgba(124,106,247,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Avatar placeholder */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto"
          style={{ background: 'var(--bg-elevated)', border: '2px solid var(--accent)' }}
        >
          👤
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
            Signed in as
          </p>
          <p className="font-semibold text-lg break-all" style={{ color: 'var(--text-primary)' }}>
            {email ?? '…'}
          </p>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          style={{
            background: 'rgba(248,113,113,0.12)',
            border: '1px solid rgba(248,113,113,0.3)',
            color: 'var(--expense)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.12)';
          }}
        >
          {isLoggingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
