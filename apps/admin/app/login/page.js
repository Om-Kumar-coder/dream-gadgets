'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api';
import { useAdminAuthStore } from '@/store/auth.store';
import { Eye, EyeOff, Shield, Smartphone } from 'lucide-react';
const loginSchema = z.object({
    identifier: z.string().min(1, 'Email or phone is required'),
    password: z.string().min(1, 'Password is required'),
});
export default function LoginPage() {
    const router = useRouter();
    const { setTokens } = useAdminAuthStore();
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({ resolver: zodResolver(loginSchema) });
    const onSubmit = async (values) => {
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
        }
        catch (err) {
            setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
        }
    };
    return (_jsxs("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-surface-50 p-4", children: [_jsxs("div", { className: "fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden", children: [_jsx("div", { className: "absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" }), _jsx("div", { className: "absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" })] }), _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-4", children: _jsx(Smartphone, { className: "w-8 h-8 text-white" }) }), _jsx("h1", { className: "text-2xl font-bold text-surface-900", children: "Dream Gadgets" }), _jsx("p", { className: "text-sm text-surface-500 mt-1", children: "Admin Panel \u2014 Sign in to continue" })] }), _jsx("div", { className: "bg-white rounded-2xl border border-surface-100 shadow-card p-8", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Email or Phone" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-surface-400", children: "\uD83D\uDC64" }), _jsx("input", { ...register('identifier'), type: "text", placeholder: "admin@dreamgadgets.in or 9876543210", className: "input pl-10" })] }), errors.identifier && (_jsx("p", { className: "text-destructive text-xs mt-1", children: errors.identifier.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-surface-400", children: "\uD83D\uDD12" }), _jsx("input", { ...register('password'), type: showPassword ? 'text' : 'password', placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "input pl-10 pr-10" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600", children: showPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] }), errors.password && (_jsx("p", { className: "text-destructive text-xs mt-1", children: errors.password.message }))] }), error && (_jsxs("div", { className: "flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3", children: [_jsx("span", { children: "\u26A0\uFE0F" }), _jsx("span", { children: error })] })), _jsx("button", { type: "submit", disabled: isSubmitting, className: "btn-primary w-full py-2.5", children: isSubmitting ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Signing in\u2026"] })) : (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4" }), "Sign In"] })) })] }) }), _jsx("p", { className: "text-center text-xs text-surface-400 mt-6", children: "Authorized personnel only. All access is monitored." })] })] }));
}
//# sourceMappingURL=page.js.map