'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API}/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message ?? 'Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message ?? 'Invalid or expired verification link.');
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    verify();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResendStatus('sending');
    setResendMessage('');

    try {
      const res = await fetch(`${API}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: resendEmail.trim() }),
      });
      const data = await res.json();

      setResendStatus('sent');
      setResendMessage(data.message ?? 'Verification email sent!');
    } catch {
      setResendStatus('error');
      setResendMessage('Failed to send. Please try again.');
    }
  };

  // ── Loading state ──
  if (status === 'loading') {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 bg-surface-50/50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <h1 className="text-xl font-bold text-surface-900 mb-2">Verifying your email…</h1>
          <p className="text-sm text-surface-500">Please wait while we confirm your address.</p>
        </div>
      </main>
    );
  }

  // ── No token provided ──
  if (status === 'no-token') {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 bg-surface-50/50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✉️</div>
          <h1 className="text-2xl font-extrabold text-surface-900 mb-2">Check Your Email</h1>
          <p className="text-sm text-surface-500 mb-6">
            We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>
          <p className="text-xs text-surface-400 mb-8">
            Didn&apos;t receive it? Check your spam folder or request a new link below.
          </p>

          {/* Resend form */}
          <div className="bg-white rounded-2xl border border-surface-100 p-6 mb-6">
            <h2 className="text-sm font-semibold text-surface-700 mb-3">Resend Verification Email</h2>
            <form onSubmit={handleResend} className="space-y-3">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <button
                type="submit"
                disabled={resendStatus === 'sending'}
                className="w-full px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {resendStatus === 'sending' ? 'Sending…' : 'Send Verification Email'}
              </button>
            </form>
            {resendMessage && (
              <p className={`mt-3 text-xs font-medium ${resendStatus === 'sent' ? 'text-emerald-600' : 'text-red-600'}`}>
                {resendMessage}
              </p>
            )}
          </div>

          <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  // ── Success ──
  if (status === 'success') {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 bg-surface-50/50">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-surface-900 mb-2">Email Verified! ✅</h1>
          <p className="text-sm text-surface-500 mb-8">{message}</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-primary/25"
          >
            Continue to Login
          </Link>
        </div>
      </main>
    );
  }

  // ── Error ──
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 bg-surface-50/50">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-surface-900 mb-2">Verification Failed</h1>
        <p className="text-sm text-surface-500 mb-6">{message}</p>

        {/* Resend form */}
        <div className="bg-white rounded-2xl border border-surface-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-3">Try Again</h2>
          <form onSubmit={handleResend} className="space-y-3">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              type="submit"
              disabled={resendStatus === 'sending'}
              className="w-full px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-50"
            >
              {resendStatus === 'sending' ? 'Sending…' : 'Resend Verification Email'}
            </button>
          </form>
          {resendMessage && (
            <p className={`mt-3 text-xs font-medium ${resendStatus === 'sent' ? 'text-emerald-600' : 'text-red-600'}`}>
              {resendMessage}
            </p>
          )}
        </div>

        <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
          Back to Login
        </Link>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-[70vh] flex items-center justify-center px-4 bg-surface-50/50">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
