'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';

export default function RegisterPage() {
  const router = useRouter();
  const { setTokens } = useWebAuthStore();
  const [step, setStep] = useState<'otp' | 'register'>('otp');
  const [form, setForm] = useState({ phone: '', otp: '', firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/send-otp', { phone: form.phone });
      setStep('register');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/auth/register', form);
      const { accessToken, refreshToken } = data.data;
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      setTokens(accessToken, refreshToken, payload);
      router.push('/account');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <div className="space-y-4">
              <div>
                <label htmlFor="register-phone" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  id="register-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => {
                    setForm(p => ({ ...p, phone: e.target.value }));
                    if (error) setError('');
                  }}
                  className="input"
                  placeholder="+91XXXXXXXXXX"
                  required
                />
                <p className="text-xs text-surface-400 mt-1">We'll send a one-time OTP to verify your number</p>
              </div>

              {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              )}

              <button
                onClick={sendOtp}
                disabled={loading || !form.phone}
                className="w-full py-3 btn-red rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="register-otp" className="block text-sm font-medium text-surface-700 mb-1.5">
                  OTP <span className="text-surface-400 font-normal">(sent to {form.phone})</span>
                </label>
                <input
                  id="register-otp"
                  name="otp"
                  type="text"
                  value={form.otp}
                  onChange={e => setForm(p => ({ ...p, otp: e.target.value }))}
                  className="input"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
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
                  onClick={() => { setStep('otp'); setError(''); }}
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
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
