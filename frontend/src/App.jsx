import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/Loader';

// Lazy-loaded pages — route-level code splitting
const Home            = lazy(() => import('./pages/Home'));
const Apply           = lazy(() => import('./pages/Apply'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const MyApplications  = lazy(() => import('./pages/MyApplications'));
const Login           = lazy(() => import('./pages/Login'));
const Register        = lazy(() => import('./pages/Register'));

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
        <BrowserRouter>
          <Navbar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/"         element={<Home />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Borrower-only routes — agents redirected to /dashboard */}
              <Route path="/apply" element={
                <ProtectedRoute borrowerOnly><Apply /></ProtectedRoute>
              } />
              <Route path="/my-applications" element={
                <ProtectedRoute borrowerOnly><MyApplications /></ProtectedRoute>
              } />

              {/* Protected — agent only */}
              <Route path="/dashboard" element={
                <ProtectedRoute agentOnly><Dashboard /></ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
