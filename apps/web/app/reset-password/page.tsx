'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../lib/api';

/** ─── Request Reset Form (no token) ─────────────────────────────────── */
function RequestResetForm() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/forgot-password', { identifier: identifier.trim() });
      setSent(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6 border border-emerald-200 shadow-lg">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Check Your Inbox</h1>
          <p className="text-sm text-surface-500 mb-6">
            If an account exists with that email or phone, we&apos;ve sent a password reset link.
            Please check your inbox (and spam folder) or your SMS messages.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.97] transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

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

        {/* Card */}
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label htmlFor="forgot-identifier" className="block text-sm font-medium text-surface-700 mb-1.5">
                Email or Phone Number
              </label>
              <input
                id="forgot-identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={e => {
                  setIdentifier(e.target.value);
                  if (error) setError('');
                }}
                className="input"
                placeholder="Enter your email or phone"
                required
                autoFocus
              />
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
                  Sending reset link...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-surface-500">
            Remember your password?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
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

/** ─── Reset Password Form (has token) ───────────────────────────────── */
function SetNewPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword: password,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        'Failed to reset password. The link may have expired. Please request a new one.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6 border border-emerald-200 shadow-lg">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Password Reset!</h1>
          <p className="text-sm text-surface-500 mb-6">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.97] transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-surface-900">Set New Password</h1>
          <p className="text-sm text-surface-500 mt-1">Enter your new password below</p>
        </div>

        {/* Card */}
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label htmlFor="reset-password" className="block text-sm font-medium text-surface-700 mb-1.5">
                New Password
              </label>
              <input
                id="reset-password"
                name="password"
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="input"
                placeholder="Min 8 characters"
                minLength={8}
                required
                autoFocus
              />
              <p className="text-xs text-surface-400 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-surface-700 mb-1.5">
                Confirm Password
              </label>
              <input
                id="reset-confirm-password"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                className="input"
                placeholder="Re-enter your password"
                minLength={8}
                required
              />
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
                  Resetting password...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-surface-500">
            Remember your password?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
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

/** ─── Expired Token View ────────────────────────────────────────────── */
function TokenExpiredView() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Invalid or Expired Link</h1>
        <p className="text-sm text-surface-500 mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/reset-password"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
        >
          Request New Reset Link
        </Link>
      </div>
    </div>
  );
}

/** ─── Main ──────────────────────────────────────────────────────────── */
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return <RequestResetForm />;
  }

  // Validate token looks like a UUID (basic check)
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
  if (!isValidUuid) {
    return <TokenExpiredView />;
  }

  return <SetNewPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
