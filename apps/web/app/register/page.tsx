'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { loadOtpWidgetSdk, extractWidgetToken } from '../../lib/otp-widget';
import { useWebAuthStore } from '../../store/auth.store';
import {
  IndianPhoneInput,
  isValidIndianMobile,
} from '../../components/auth/IndianPhoneInput';

export default function RegisterPage() {
  const router = useRouter();
  const { setTokens } = useWebAuthStore();
  const [step, setStep] = useState<'otp' | 'register'>('otp');
  const [form, setForm] = useState({ phone: '', firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // JWT access token produced by the MSG91 widget after successful verification
  const [widgetToken, setWidgetToken] = useState('');

  // Open the MSG91 OTP Widget popup (the same "iframe" popup that worked
  // earlier). MSG91 sends and verifies the OTP itself, then hands back a JWT
  // that the backend exchanges for the verified phone.
  async function sendOtp(e?: React.MouseEvent | React.FormEvent) {
    e?.preventDefault();
    if (!form.phone.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    if (!isValidIndianMobile(form.phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await loadOtpWidgetSdk();
      if (!process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || !process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH) {
        setError('OTP widget is not configured. Please contact support.');
        return;
      }
      window.initSendOTP!({
        widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID,
        tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH,
        // Pre-fills / hints the number entered on the page
        identifier: form.phone.trim(),
        success: (data: unknown) => {
          // MSG91 documents the JWT in data.accessToken (message/token are
          // legacy fallbacks for older SDK versions).
          const token = extractWidgetToken(data);
          if (!token) {
            setError('OTP verification failed — no token was returned. Please try again.');
            return;
          }
          setWidgetToken(token);
          setStep('register');
          setError('');
        },
        failure: (err: unknown) => {
          const msg = typeof err === 'string' ? err : (err as { message?: string })?.message ?? 'OTP verification failed';
          setError(msg);
        },
      });
    } catch (err: any) {
      setError(err?.message ?? 'Could not open the verification widget. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        // The widget's JWT proves the phone was verified; the backend derives
        // the number from MSG91's response, so we don't send it here.
        widgetToken: widgetToken,
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        // Avoid sending '' — the API's @IsEmail() rejects empty strings
        email: form.email?.trim() ? form.email.trim() : undefined,
        password: form.password,
      };
      const { data } = await apiClient.post('/auth/register', payload);
      const { accessToken, refreshToken } = data.data;
      const jwtPayload = JSON.parse(atob(accessToken.split('.')[1]));
      setTokens(accessToken, refreshToken, jwtPayload);
      router.push('/account');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  function changePhone() {
    setStep('otp');
    setError('');
    setWidgetToken('');
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Create Account</h1>
          <p className="text-sm text-surface-500 mt-1">Join Dream Gadgets today</p>
        </div>

        {/* Card */}
        <div className="card p-6 sm:p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              step === 'otp' ? 'bg-primary text-white shadow-sm' : 'bg-primary/10 text-primary'
            }`}>
              <span>1</span>
              <span>Verify Phone</span>
            </div>
            <div className="w-6 h-px bg-surface-200" />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              step === 'register' ? 'bg-primary text-white shadow-sm' : 'bg-surface-100 text-surface-400'
            }`}>
              <span>2</span>
              <span>Details</span>
            </div>
          </div>

          {step === 'otp' ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <IndianPhoneInput
                id="register-phone"
                name="phone"
                value={form.phone}
                onChange={v => {
                  setForm(p => ({ ...p, phone: v }));
                  if (error) setError('');
                }}
                error={error || undefined}
                required
              />

              <button
                type="submit"
                disabled={loading || !form.phone}
                className="w-full py-3 btn-red rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Opening verification...
                  </span>
                ) : (
                  'Verify Phone'
                )}
              </button>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* The widget verified the phone before returning its token */}
              <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                <span className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Phone verified</span>
                </span>
                <button
                  type="button"
                  onClick={changePhone}
                  className="text-xs font-semibold text-green-700 hover:text-green-800 underline transition-colors disabled:opacity-40"
                >
                  Change
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-firstName" className="block text-sm font-medium text-surface-700 mb-1.5">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="register-firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                    className="input"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="register-lastName" className="block text-sm font-medium text-surface-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    id="register-lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                    className="input"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Email <span className="text-surface-400 font-normal">(optional)</span>
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input"
                  placeholder="Min 8 characters"
                  minLength={8}
                  required
                />
                <p className="text-xs text-surface-400 mt-1">At least 8 characters</p>
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
                className="w-full py-3 btn-red rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={changePhone}
                  className="text-xs text-surface-400 hover:text-surface-600 transition-colors"
                >
                  ← Change phone number
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-surface-500 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
