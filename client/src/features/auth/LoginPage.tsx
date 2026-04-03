import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const LogoMark = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="10" fill="var(--accent)" fillOpacity="0.15" />
    <path d="M9 18C9 13.582 12.582 10 17 10C21.418 10 25 13.582 25 18" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M13 22.5L17 18.5L21 22.5" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="17" cy="18.5" r="2" fill="var(--accent)" />
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-grid min-h-screen flex items-center justify-center px-4 py-12">
      <div
        className="card-glass w-full max-w-sm rounded-2xl p-8"
        style={{ borderColor: 'rgba(124,106,247,0.18)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <LogoMark />
          <h1 className="mt-3 text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            ExpenseTracker
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="input-glow w-full px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="input-glow w-full px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.25)',
                color: 'var(--expense)',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-accent w-full py-3 rounded-xl text-sm mt-2"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold transition-colors"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
