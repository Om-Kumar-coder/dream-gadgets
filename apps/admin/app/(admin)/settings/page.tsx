import { Suspense } from 'react';
import { SettingsPageContent } from './settings-content';
import { PermissionGate } from '@/components/auth/PermissionGate';

export default function SettingsPage() {
  return (
    <PermissionGate permission="settings.view">
    <Suspense fallback={<div className="animate-pulse">Loading settings...</div>}>
      <SettingsPageContent />
    </Suspense>
    </PermissionGate>
  );
}
