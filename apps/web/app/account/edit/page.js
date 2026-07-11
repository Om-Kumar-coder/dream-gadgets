'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';
import { useWebAuthStore } from '../../../store/auth.store';
export default function EditAccountPage() {
    const router = useRouter();
    const { user } = useWebAuthStore();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    useEffect(() => {
        if (!user)
            return;
        apiClient
            .get('/auth/me')
            .then(r => {
            const raw = r.data;
            const data = raw?.data ?? raw;
            setFirstName(data.firstName ?? '');
            setLastName(data.lastName ?? '');
            setEmail(data.email ?? '');
        })
            .catch(() => setProfileError('Failed to load profile'))
            .finally(() => setProfileLoading(false));
    }, [user]);
    if (!user) {
        return (_jsx("div", { className: "min-h-[70vh] flex items-center justify-center px-4", children: _jsxs("div", { className: "text-center max-w-sm", children: [_jsx("div", { className: "w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6", children: _jsx("svg", { className: "w-10 h-10 text-primary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }), _jsx("h1", { className: "heading-md text-surface-900 mb-2", children: "Edit Profile" }), _jsx("p", { className: "text-surface-500 mb-6", children: "Sign in to manage your profile settings." }), _jsxs(Link, { href: "/login", className: "btn-primary btn-lg", children: ["Sign In", _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) })] })] }) }));
    }
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        if (!firstName.trim()) {
            setProfileError('First name is required');
            return;
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setProfileError('Please enter a valid email address');
            return;
        }
        setProfileSaving(true);
        try {
            const body = {};
            if (firstName)
                body.firstName = firstName.trim();
            if (lastName !== undefined)
                body.lastName = lastName.trim();
            if (email)
                body.email = email.trim();
            await apiClient.patch('/auth/me', body);
            setProfileSuccess('Profile updated successfully!');
            setTimeout(() => setProfileSuccess(''), 3000);
        }
        catch (err) {
            const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? 'Failed to update profile';
            setProfileError(typeof msg === 'string' ? msg : 'Failed to update profile');
        }
        finally {
            setProfileSaving(false);
        }
    };
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        if (!currentPassword) {
            setPasswordError('Current password is required');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        setPasswordSaving(true);
        try {
            await apiClient.post('/auth/change-password', { currentPassword, newPassword });
            setPasswordSuccess('Password changed! Please log in again.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => router.push('/login'), 2000);
        }
        catch (err) {
            const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? 'Failed to change password';
            setPasswordError(typeof msg === 'string' ? msg : 'Failed to change password');
        }
        finally {
            setPasswordSaving(false);
        }
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-fade-in", children: [_jsxs("div", { className: "mb-6", children: [_jsxs(Link, { href: "/account", className: "inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-600 mb-3 transition-colors", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Back to Account"] }), _jsx("h1", { className: "heading-md text-surface-900", children: "Edit Profile" }), _jsx("p", { className: "text-sm text-surface-400 mt-0.5", children: "Manage your personal information and security" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "card p-5 sm:p-6", children: [_jsx("h2", { className: "text-base font-bold text-surface-900 mb-1", children: "Personal Information" }), _jsx("p", { className: "text-xs text-surface-400 mb-5", children: "Update your name and email address" }), profileLoading ? (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-10 bg-surface-100 animate-pulse rounded-xl" }), _jsx("div", { className: "h-10 bg-surface-100 animate-pulse rounded-xl" }), _jsx("div", { className: "h-10 bg-surface-100 animate-pulse rounded-xl" })] })) : (_jsxs("form", { onSubmit: handleProfileUpdate, className: "space-y-4", children: [profileError && (_jsxs("div", { className: "p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5", children: [_jsx("svg", { className: "w-4 h-4 text-red-500 shrink-0 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("p", { className: "text-sm text-red-700", children: profileError })] })), profileSuccess && (_jsxs("div", { className: "p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5", children: [_jsx("svg", { className: "w-4 h-4 text-emerald-500 shrink-0 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("p", { className: "text-sm text-emerald-700", children: profileSuccess })] })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "firstName", className: "block text-xs font-semibold text-surface-700 mb-1.5", children: ["First Name ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { id: "firstName", type: "text", value: firstName, onChange: e => setFirstName(e.target.value), className: "input-field", placeholder: "John" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "lastName", className: "block text-xs font-semibold text-surface-700 mb-1.5", children: "Last Name" }), _jsx("input", { id: "lastName", type: "text", value: lastName, onChange: e => setLastName(e.target.value), className: "input-field", placeholder: "Doe" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-xs font-semibold text-surface-700 mb-1.5", children: "Email Address" }), _jsx("input", { id: "email", type: "email", value: email, onChange: e => setEmail(e.target.value), className: "input-field", placeholder: "john@example.com" }), _jsx("p", { className: "text-[10px] text-surface-400 mt-1", children: "We'll send a verification email if you change this" })] }), _jsxs("div", { className: "flex items-center gap-3 pt-1", children: [_jsx("button", { type: "submit", disabled: profileSaving, className: "btn-primary btn-md", children: profileSaving ? (_jsxs("span", { className: "flex items-center gap-2", children: [_jsxs("svg", { className: "w-4 h-4 animate-spin", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Saving..."] })) : 'Save Changes' }), _jsx(Link, { href: "/account", className: "btn-ghost btn-md", children: "Cancel" })] })] }))] }), _jsxs("div", { className: "card p-5 sm:p-6", children: [_jsx("h2", { className: "text-base font-bold text-surface-900 mb-1", children: "Change Password" }), _jsx("p", { className: "text-xs text-surface-400 mb-5", children: "Update your password. You'll need to log in again after changing it." }), _jsxs("form", { onSubmit: handlePasswordChange, className: "space-y-4", children: [passwordError && (_jsxs("div", { className: "p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5", children: [_jsx("svg", { className: "w-4 h-4 text-red-500 shrink-0 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("p", { className: "text-sm text-red-700", children: passwordError })] })), passwordSuccess && (_jsxs("div", { className: "p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5", children: [_jsx("svg", { className: "w-4 h-4 text-emerald-500 shrink-0 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("p", { className: "text-sm text-emerald-700", children: passwordSuccess })] })), _jsxs("div", { children: [_jsxs("label", { htmlFor: "currentPassword", className: "block text-xs font-semibold text-surface-700 mb-1.5", children: ["Current Password ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { id: "currentPassword", type: "password", value: currentPassword, onChange: e => setCurrentPassword(e.target.value), className: "input-field", placeholder: "Enter current password" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "newPassword", className: "block text-xs font-semibold text-surface-700 mb-1.5", children: ["New Password ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { id: "newPassword", type: "password", value: newPassword, onChange: e => setNewPassword(e.target.value), className: "input-field", placeholder: "Min 8 characters", minLength: 8 }), _jsx("p", { className: "text-[10px] text-surface-400 mt-1", children: "At least 8 characters" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "confirmPassword", className: "block text-xs font-semibold text-surface-700 mb-1.5", children: ["Confirm New Password ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { id: "confirmPassword", type: "password", value: confirmPassword, onChange: e => setConfirmPassword(e.target.value), className: "input-field", placeholder: "Re-enter new password", minLength: 8 })] }), _jsx("div", { className: "flex items-center gap-3 pt-1", children: _jsx("button", { type: "submit", disabled: passwordSaving, className: "btn-secondary btn-md", children: passwordSaving ? (_jsxs("span", { className: "flex items-center gap-2", children: [_jsxs("svg", { className: "w-4 h-4 animate-spin", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Updating..."] })) : 'Change Password' }) })] })] })] })] }));
}
//# sourceMappingURL=page.js.map