import { SetMetadata } from '@nestjs/common';
import type { Permission } from '../constants/permissions.constants';

export const SELF_OR_PERMISSION_KEY = 'self_or_permission';

export interface SelfOrPermissionMetadata {
  paramKey: string;
  permission: Permission;
}

export const SelfOrPermission = (paramKey: string, permission: Permission) =>
  SetMetadata(SELF_OR_PERMISSION_KEY, {
    paramKey,
    permission,
  } satisfies SelfOrPermissionMetadata);
