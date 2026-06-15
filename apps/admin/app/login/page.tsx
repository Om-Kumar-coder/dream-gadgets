'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api';
import { useAdminAuthStore } from '@/store/auth.store';
import { Button } from '@dream-gadgets/ui';
import { Eye, EyeOff, Shield, Smartphone } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setTokens } = useAdminAuthStore();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    setError('');
    try {
      const { data } = await apiClient.post('/auth/login', {
        identifier: values.identifier,
        password: values.password,
      });
      const { accessToken, refreshToken, user } = data.data;
      localStorage.setItem('admin_access_token', accessToken);
      localStorage.setItem('admin_refresh_token', refreshToken);
      document.cookie = `admin_access_token=${accessToken}; path=/; max-age=900; SameSite=Lax`;
      const jwtPayload = JSON.parse(atob(accessToken.split('.')[1]));
      setTokens(accessToken, refreshToken, jwtPayload);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-surface-50 p-4">
      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Dream Gadgets</h1>
          <p className="text-sm text-surface-500 mt-1">Admin Panel — Sign in to continue</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email or Phone */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Email or Phone
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                  👤
                </span>
                <input
                  {...register('identifier')}
                  type="text"
                  placeholder="admin@dreamgadgets.in or 9876543210"
                  className="input pl-10"
                />
              </div>
              {errors.identifier && (
                <p className="text-destructive text-xs mt-1">{errors.identifier.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                  🔒
                </span>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Sign In
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-surface-400 mt-6">
          Authorized personnel only. All access is monitored.
        </p>
      </div>
    </div>
  );
}
