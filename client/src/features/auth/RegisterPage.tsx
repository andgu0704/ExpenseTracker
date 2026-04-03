import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const LogoMark = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="10" fill="var(--accent)" fillOpacity="0.15" />
    <path d="M9 18C9 13.582 12.582 10 17 10C21.418 10 25 13.582 25 18" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M13 22.5L17 18.5L21 22.5" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="17" cy="18.5" r="2" fill="var(--accent)" />
  </svg>
);

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) {
        setError(authError.message);
      } else {
        setSuccess(true);
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
            Create your account
          </p>
        </div>

        {success ? (
          <div
            className="px-6 py-8 rounded-2xl text-center space-y-3"
            style={{
              background: 'rgba(52,211,153,0.06)',
              border: '1px solid rgba(52,211,153,0.25)',
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--income)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <p className="font-semibold text-base" style={{ color: 'var(--income)' }}>
              Check your email!
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              We've sent a confirmation link to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              Click it to activate your account.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 text-sm font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              Back to Sign In →
            </Link>
          </div>
        ) : (
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
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                className="input-glow w-full px-4 py-3 rounded-xl text-sm"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repeat password"
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
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        {!success && (
          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold transition-colors"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
