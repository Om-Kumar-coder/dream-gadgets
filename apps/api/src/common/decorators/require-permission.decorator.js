import { SetMetadata } from '@nestjs/common';
import { PERMISSION_KEY } from '../guards/permission.guard';
export const RequirePermission = (permission) => SetMetadata(PERMISSION_KEY, permission);
//# sourceMappingURL=require-permission.decorator.js.map