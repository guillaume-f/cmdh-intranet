import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../../roles/roles.service';
import { User } from '../../users/entities/user.entity';
import type { Permission } from '../constants/permissions.constants';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface RequestWithUser {
  user?: User;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('Missing authenticated user context.');
    }

    const userPermissions = this.rolesService.resolvePermissions(user);
    const missingPermission = requiredPermissions.find(
      (permission) => !userPermissions.includes(permission),
    );

    if (missingPermission) {
      throw new UnauthorizedException(
        `Missing permission: ${missingPermission}`,
      );
    }

    return true;
  }
}
