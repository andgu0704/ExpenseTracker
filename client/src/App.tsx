import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './features/auth/ProtectedRoute';
import Layout from './components/ui/Layout';

// Lazy-load all page-level components for code splitting
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const TransactionsPage = lazy(() => import('./features/transactions/TransactionsPage'));
const AddTransactionPage = lazy(() => import('./features/transactions/AddTransactionPage'));
const EditTransactionPage = lazy(() => import('./features/transactions/EditTransactionPage'));
const ProfilePage = lazy(() => import('./features/auth/ProfilePage'));

/** Full-page skeleton shown during lazy-load suspense */
const PageLoader = () => (
  <div
    className="flex items-center justify-center min-h-screen"
    style={{ background: 'var(--bg-base)' }}
  >
    <div className="space-y-3 w-64">
      <div className="skeleton h-6 rounded-xl w-3/4" />
      <div className="skeleton h-4 rounded-xl w-full" />
      <div className="skeleton h-4 rounded-xl w-5/6" />
    </div>
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — wrapped in Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Layout>
                <TransactionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/new"
          element={
            <ProtectedRoute>
              <Layout>
                <AddTransactionPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditTransactionPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
