'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';

export default function LoginPage() {
  const router = useRouter();
  const { setTokens } = useWebAuthStore();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/auth/login', {
        identifier: form.identifier,
        password: form.password,
      });
      const { accessToken, refreshToken } = data.data;
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      setTokens(accessToken, refreshToken, payload);
      router.push('/account');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Forgot password view (embedded) ─────────────────────── */
  if (showForgotPassword) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-surface-900">Forgot Password</h1>
            <p className="text-sm text-surface-500 mt-1">
              Enter your email or phone number and we&apos;ll send you a reset link
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            <ForgotPasswordForm embedded onBack={() => setShowForgotPassword(false)} />
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <Link href="/" className="text-xs text-surface-400 hover:text-surface-600 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Login view ──────────────────────────────────────────── */
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Welcome Back</h1>
          <p className="text-sm text-surface-500 mt-1">Sign in to your Dream Gadgets account</p>
        </div>

        {/* Card */}
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-identifier" className="block text-sm font-medium text-surface-700 mb-1.5">
                Email or Phone Number
              </label>
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                value={form.identifier}
                onChange={e => setForm(p => ({ ...p, identifier: e.target.value }))}
                className="input"
                placeholder="Enter your email or phone"
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-surface-700 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="input"
                placeholder="Enter your password"
                required
              />
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-primary hover:text-primary-hover hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-surface-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create Account
            </Link>
          </p>
          <Link href="/" className="inline-block mt-3 text-xs text-surface-400 hover:text-surface-600 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
