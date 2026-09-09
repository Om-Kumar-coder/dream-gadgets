import { PermissionGate } from '@/components/auth/PermissionGate';
import { BrandHeroManager } from '@/components/banners/BrandHeroManager';

export default function BrandsPage() {
  return (
    <PermissionGate permission="content.view">
      <BrandHeroManager />
    </PermissionGate>
  );
}
