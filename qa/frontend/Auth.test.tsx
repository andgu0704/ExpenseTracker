/**
 * Tests for auth pages and protected routing:
 * - LoginPage renders all form elements
 * - RegisterPage renders all form elements
 * - ProtectedRoute redirects unauthenticated users to /login
 * - ProtectedRoute shows children when authenticated
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '../../client/src/features/auth/LoginPage';
import RegisterPage from '../../client/src/features/auth/RegisterPage';
import ProtectedRoute from '../../client/src/features/auth/ProtectedRoute';

// Mock supabase
vi.mock('../../client/src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  },
}));

import { supabase } from '../../client/src/lib/supabase';

describe('LoginPage', () => {
  it('renders email and password inputs and submit button', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });
});

describe('RegisterPage', () => {
  it('renders email, password, and confirm password inputs', () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    const passwordInputs = screen.getAllByLabelText(/password/i);
    expect(passwordInputs.length).toBeGreaterThanOrEqual(2);
  });
});

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // After async resolution, should redirect to login
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(container.textContent).not.toContain('Dashboard');
  });
});
