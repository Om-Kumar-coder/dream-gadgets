'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api';
import { useAdminAuthStore } from '@/store/auth.store';
import { Button } from '@dream-gadgets/ui';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setTokens } = useAdminAuthStore();
  const [error, setError] = useState('');

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
      // Decode JWT payload (flat structure with role as string) instead of raw user entity
      const jwtPayload = JSON.parse(atob(accessToken.split('.')[1]));
      setTokens(accessToken, refreshToken, jwtPayload);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] bg-cyber-grid">
      {/* Glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[#FF2D2D]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-[#00FF9C]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-8 relative"
        style={{ boxShadow: '0 0 40px rgba(255,45,45,0.1)' }}>
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF2D2D]/10 border border-[#FF2D2D]/30 mb-4">
            <span className="text-[#FF2D2D] text-xl font-bold">DG</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Dream Gadgets</h1>
          <p className="text-sm text-gray-600 mt-1 font-mono">ADMIN_PANEL://AUTHENTICATE</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
              Email or Phone
            </label>
            <input
              {...register('identifier')}
              type="text"
              placeholder="admin@dreamgadgets.in"
              className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-700
                         focus:outline-none focus:border-[#00FF9C] focus:ring-1 focus:ring-[#00FF9C] transition-all duration-200"
            />
            {errors.identifier && <p className="text-[#FF2D2D] text-xs mt-1">{errors.identifier.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-700
                         focus:outline-none focus:border-[#00FF9C] focus:ring-1 focus:ring-[#00FF9C] transition-all duration-200"
            />
            {errors.password && <p className="text-[#FF2D2D] text-xs mt-1">{errors.password.message}</p>}
          </div>

          {error && (
            <div className="bg-[#FF2D2D]/10 border border-[#FF2D2D]/30 text-[#FF2D2D] text-sm rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
            {isSubmitting ? 'Authenticating…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
