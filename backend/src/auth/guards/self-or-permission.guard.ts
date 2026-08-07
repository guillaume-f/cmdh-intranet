import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../../roles/roles.service';
import { User } from '../../users/entities/user.entity';
import {
  SELF_OR_PERMISSION_KEY,
  SelfOrPermissionMetadata,
} from '../decorators/self-or-permission.decorator';

interface RequestWithUserAndParams {
  user?: User;
  params?: Record<string, string | undefined>;
}

@Injectable()
export class SelfOrPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = this.reflector.getAllAndOverride<SelfOrPermissionMetadata>(
      SELF_OR_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata) {
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestWithUserAndParams>();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('Missing authenticated user context.');
    }

    const targetUserId = req.params?.[metadata.paramKey];
    if (targetUserId && targetUserId === user.id) {
      return true;
    }

    const userPermissions = this.rolesService.resolvePermissions(user);
    if (!userPermissions.includes(metadata.permission)) {
      throw new ForbiddenException(
        `Missing permission: ${metadata.permission}`,
      );
    }

    return true;
  }
}
