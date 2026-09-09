import { PermissionGate } from '@/components/auth/PermissionGate';
import { BannerManager } from '@/components/banners/BannerManager';

export default function BannersPage() {
  return (
    <PermissionGate permission="content.view">
      <BannerManager />
    </PermissionGate>
  );
}
