'use client';

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../lib/api';

const COOLDOWN_SECONDS = 60;
const STORAGE_KEY = 'forgot-password-cooldown';

/** Safe localStorage getter — returns null if unavailable (private browsing, quota, etc.) */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Safe localStorage setter — no-ops if unavailable */
function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* noop */
  }
}

/** Safe localStorage remover — no-ops if unavailable */
function safeRemoveItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

interface ForgotPasswordFormProps {
  /** Callback when the user wants to go back to the login form */
  onBack?: () => void;
  /** If true, renders a compact version without full-page layout, suitable for embedding */
  embedded?: boolean;
}

/**
 * Forgot Password form component with rate-limit cooldown.
 *
 * After sending a reset link, a cooldown timer prevents spam.
 * The cooldown is persisted in localStorage so it survives page refreshes.
 *
 * Can be used standalone (full-page layout) or embedded in another page
 * (e.g. the login page) by passing `embedded={true}`.
 */
export default function ForgotPasswordForm({ onBack, embedded = false }: ForgotPasswordFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Restore cooldown from localStorage on mount ──────── */
  useEffect(() => {
    const stored = safeGetItem(STORAGE_KEY);
    if (stored) {
      const expiresAt = parseInt(stored, 10);
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      if (remaining > 0) {
        setSent(true);
        setCooldownRemaining(remaining);
      } else {
        safeRemoveItem(STORAGE_KEY);
      }
    }
  }, []);

  /* ── Cooldown countdown interval ──────────────────────── */
  useEffect(() => {
    if (!sent) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          safeRemoveItem(STORAGE_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sent]);

  /* ── Submit handler ────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/forgot-password', { identifier: identifier.trim() });      const expiresAt = Date.now() + COOLDOWN_SECONDS * 1000;
          safeSetItem(STORAGE_KEY, expiresAt.toString());
          setCooldownRemaining(COOLDOWN_SECONDS);
          setSent(true);
    } catch (err: any) {
      // 429 = rate limited — show cooldown from server response
      if (err?.response?.status === 429) {
        const retryAfter = parseInt(
          err?.response?.data?.retryAfter ?? err?.response?.headers?.['retry-after'] ?? String(COOLDOWN_SECONDS),
          10,
        );
        const expiresAt = Date.now() + retryAfter * 1000;
        safeSetItem(STORAGE_KEY, expiresAt.toString());
        setCooldownRemaining(retryAfter);
        setSent(true);
        return;
      }
      setError(
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  /* ── Request another link ──────────────────────────────── */
  function handleRequestAnother() {
    setSent(false);
    setCooldownRemaining(0);
    safeRemoveItem(STORAGE_KEY);
  }

  /* ── Format remaining time ─────────────────────────────── */
  function formatCooldown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
    return `${s}s`;
  }

  /* ═══════════════════════════════════════════════════════════
     SUCCESS STATE (cooldown active or expired)
     ═══════════════════════════════════════════════════════════ */
  if (sent) {
    return (
      <div className="text-center">
        {/* Mail icon */}
        <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4 border border-emerald-200 shadow-sm">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-surface-900 mb-1">Check Your Inbox</h2>
        <p className="text-sm text-surface-500 mb-5">
          If an account exists with that email or phone, we&apos;ve sent a password reset link.
          Please check both your inbox and spam folder.
        </p>

        {/* ── Cooldown indicator ──────────────────────── */}
        {cooldownRemaining > 0 ? (
          <div className="flex items-center justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-800">
              <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Request another link in{' '}
                <strong className="font-mono tabular-nums">{formatCooldown(cooldownRemaining)}</strong>
              </span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleRequestAnother}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.97] transition-all shadow-sm mb-5"
          >
            {/* Refresh icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Request Another Reset Link
          </button>
        )}

        {/* ── Back to login ────────────────────────────── */}
        <div className="border-t border-surface-200 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-primary hover:underline transition-colors"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     FORM STATE
     ═══════════════════════════════════════════════════════════ */
  const formContent = (
    <>
      {/* Header */}
      {!embedded && (
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
      )}

      {/* Card / Form wrapper */}
      <div className={embedded ? '' : 'card p-6 sm:p-8'}>
        <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Footer */}
        {onBack && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-primary hover:underline transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        )}
      </div>
    </>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50">
      <div className="w-full max-w-md">
        {formContent}
      </div>
    </div>
  );
}
