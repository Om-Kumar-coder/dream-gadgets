import { Suspense } from 'react';
import { SettingsPageContent } from './settings-content';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading settings...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
