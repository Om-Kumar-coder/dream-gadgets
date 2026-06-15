'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';
import { useWebAuthStore } from '../../../store/auth.store';

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

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
    if (!user) return;
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
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="heading-md text-surface-900 mb-2">Edit Profile</h1>
          <p className="text-surface-500 mb-6">Sign in to manage your profile settings.</p>
          <Link href="/login" className="btn-primary btn-lg">
            Sign In
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
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
      const body: Record<string, string> = {};
      if (firstName) body.firstName = firstName.trim();
      if (lastName !== undefined) body.lastName = lastName.trim();
      if (email) body.email = email.trim();

      await apiClient.patch('/auth/me', body);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? 'Failed to update profile';
      setProfileError(typeof msg === 'string' ? msg : 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? 'Failed to change password';
      setPasswordError(typeof msg === 'string' ? msg : 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <Link href="/account" className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-600 mb-3 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Account
        </Link>
        <h1 className="heading-md text-surface-900">Edit Profile</h1>
        <p className="text-sm text-surface-400 mt-0.5">Manage your personal information and security</p>
      </div>

      <div className="space-y-6">
        {/* Profile Info Card */}
        <div className="card p-5 sm:p-6">
          <h2 className="text-base font-bold text-surface-900 mb-1">Personal Information</h2>
          <p className="text-xs text-surface-400 mb-5">Update your name and email address</p>

          {profileLoading ? (
            <div className="space-y-4">
              <div className="h-10 bg-surface-100 animate-pulse rounded-xl" />
              <div className="h-10 bg-surface-100 animate-pulse rounded-xl" />
              <div className="h-10 bg-surface-100 animate-pulse rounded-xl" />
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {profileError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{profileError}</p>
                </div>
              )}
              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-emerald-700">{profileSuccess}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-semibold text-surface-700 mb-1.5">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input id="firstName" type="text" value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="input-field" placeholder="John" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs font-semibold text-surface-700 mb-1.5">Last Name</label>
                  <input id="lastName" type="text" value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="input-field" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-surface-700 mb-1.5">Email Address</label>
                <input id="email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field" placeholder="john@example.com" />
                <p className="text-[10px] text-surface-400 mt-1">We&apos;ll send a verification email if you change this</p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button type="submit" disabled={profileSaving} className="btn-primary btn-md">
                  {profileSaving ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
                <Link href="/account" className="btn-ghost btn-md">Cancel</Link>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Card */}
        <div className="card p-5 sm:p-6">
          <h2 className="text-base font-bold text-surface-900 mb-1">Change Password</h2>
          <p className="text-xs text-surface-400 mb-5">Update your password. You&apos;ll need to log in again after changing it.</p>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{passwordError}</p>
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-emerald-700">{passwordSuccess}</p>
              </div>
            )}

            <div>
              <label htmlFor="currentPassword" className="block text-xs font-semibold text-surface-700 mb-1.5">
                Current Password <span className="text-red-400">*</span>
              </label>
              <input id="currentPassword" type="password" value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="input-field" placeholder="Enter current password" />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-xs font-semibold text-surface-700 mb-1.5">
                New Password <span className="text-red-400">*</span>
              </label>
              <input id="newPassword" type="password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input-field" placeholder="Min 8 characters" minLength={8} />
              <p className="text-[10px] text-surface-400 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-surface-700 mb-1.5">
                Confirm New Password <span className="text-red-400">*</span>
              </label>
              <input id="confirmPassword" type="password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="input-field" placeholder="Re-enter new password" minLength={8} />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={passwordSaving} className="btn-secondary btn-md">
                {passwordSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Updating...
                  </span>
                ) : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
