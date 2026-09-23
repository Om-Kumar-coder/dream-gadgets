'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';
import {
  IndianPhoneInput,
  isValidIndianMobile,
} from '../../components/auth/IndianPhoneInput';

export default function RegisterPage() {
  const router = useRouter();
  const { setTokens } = useWebAuthStore();
  const [step, setStep] = useState<'otp' | 'register'>('otp');
  const [form, setForm] = useState({ phone: '', otp: '', firstName: '', lastName: '', email: '', password: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: send an OTP to the user's Indian number via the MSG91 server API.
  // The number is used exactly as entered — no country detection anywhere.
  async function sendOtp(e?: React.MouseEvent | React.FormEvent) {
    e?.preventDefault();
    setError('');
    if (!form.phone.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    if (!isValidIndianMobile(form.phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/send-otp', { phone: form.phone });
      setDevOtp(data?.data?.devOtp ?? '');
      setOtpSent(true);
      setResendIn(30);
      const timer = setInterval(() => {
        setResendIn(s => {
          if (s <= 1) { clearInterval(timer); return 0; }
          return s - 1;
        });
      }, 1000);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Could not send the OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  // Step 1b: sanity-check the code, then continue to the details step.
  // The register endpoint re-verifies the OTP (it is single-use) and creates
  // the account in one atomic call.
  function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(form.otp)) {
      setError('Enter the 6-digit code we sent you');
      return;
    }
    setStep('register');
  }

  // Step 2: create the account (server verifies the OTP again — it is single-use).
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        // The phone exactly as entered; the backend normalizes and verifies it.
        phone: form.phone,
        otp: form.otp,
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
      // An invalid/expired OTP means the user must re-verify.
      if (/otp/i.test(String(msg))) {
        setStep('otp');
        setForm(p => ({ ...p, otp: '' }));
      }
    } finally {
      setLoading(false);
    }
  }

  function changePhone() {
    setStep('otp');
    setError('');
    setDevOtp('');
    setOtpSent(false);
    setForm(p => ({ ...p, otp: '' }));
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
            <form onSubmit={otpSent ? verifyOtp : sendOtp} className="space-y-4">
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

              {otpSent && (
                <>
                  <div className="flex items-center justify-between bg-surface-50 border border-surface-100 rounded-xl px-4 py-3">
                    <span className="text-sm text-surface-600">
                      Code sent to <strong className="text-surface-900">+91 {form.phone.replace(/\D/g, '')}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={changePhone}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label htmlFor="register-otp" className="block text-sm font-medium text-surface-700 mb-1.5">
                      6-Digit Code
                    </label>
                    <input
                      id="register-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={form.otp}
                      onChange={e => {
                        setForm(p => ({ ...p, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }));
                        if (error) setError('');
                      }}
                      className="input text-center text-lg tracking-[0.4em] font-mono"
                      placeholder="••••••"
                      required
                    />
                  </div>

                  {devOtp && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
                      Dev mode OTP: <strong className="font-mono">{devOtp}</strong>
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={loading || (!otpSent && !form.phone)}
                className="w-full py-3 btn-red rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {otpSent ? 'Verifying...' : 'Sending OTP...'}
                  </span>
                ) : (
                  otpSent ? 'Verify & Continue' : 'Send OTP'
                )}
              </button>

              {otpSent && resendIn > 0 && (
                <p className="text-center text-xs text-surface-400">Resend available in {resendIn}s</p>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Phone was verified by the OTP the user typed in */}
              <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                <span className="flex items-center gap-2">
                  <span>✅</span>
                  <span>
                    +91 {form.phone.replace(/\D/g, '')} verified
                  </span>
                </span>
                <button
                  type="button"
                  onClick={changePhone}
                  className="text-xs font-semibold text-green-700 hover:text-green-800 underline transition-colors disabled:opacity-40"
                >
                  Change
                </button>
              </div>

              <div>
                <label htmlFor="register-otp" className="block text-sm font-medium text-surface-700 mb-1.5">
                  OTP Code <span className="text-red-400">*</span>
                </label>
                <input
                  id="register-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={form.otp}
                  onChange={e => setForm(p => ({ ...p, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  className="input text-center text-lg tracking-[0.4em] font-mono"
                  placeholder="••••••"
                  required
                />
                <p className="text-xs text-surface-400 mt-1">Enter the 6-digit code sent to your number</p>
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
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
