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
      setError(err?.response?.data?.error?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center mb-8">Create Account</h1>

      {step === 'otp' ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="+91XXXXXXXXXX" required />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button onClick={sendOtp} disabled={loading || !form.phone}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50">
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm font-medium">OTP (sent to {form.phone})</label>
            <input type="text" value={form.otp} onChange={e => setForm(p => ({ ...p, otp: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2" maxLength={6} required />
          </div>
          {[
            { key: 'firstName', label: 'First Name', type: 'text' },
            { key: 'lastName', label: 'Last Name', type: 'text' },
            { key: 'email', label: 'Email (optional)', type: 'email' },
            { key: 'password', label: 'Password', type: 'password' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2" required={f.key !== 'email'} />
            </div>
          ))}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      )}

      <p className="text-center text-sm mt-4">
        Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
      </p>
    </div>
  );
}
