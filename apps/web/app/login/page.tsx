'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const { setTokens } = useWebAuthStore();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/auth/login', form);
      const { accessToken, refreshToken } = data.data;
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      setTokens(accessToken, refreshToken, payload);
      router.push('/account');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center mb-8">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email or Phone</label>
          <input
            type="text"
            value={form.identifier}
            onChange={e => setForm(p => ({ ...p, identifier: e.target.value }))}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center text-sm mt-4">
        Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline">Register</Link>
      </p>
    </div>
  );
}
