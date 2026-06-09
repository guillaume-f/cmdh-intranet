import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: Record<string, unknown>) {
    const email = typeof payload.email === 'string' ? payload.email : '';
    const password = typeof payload.password === 'string' ? payload.password : '';

    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    const permissions = this.rolesService.resolvePermissions(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.id ?? '',
        permissions,
      },
    };
  }

  forgotPassword(payload: Record<string, unknown>) {
    return {
      message: 'If this email exists, a reset link has been sent.',
      request: payload,
    };
  }

  resetPassword(payload: Record<string, unknown>) {
    return {
      message: 'Password updated successfully.',
      request: payload,
    };
  }

  async me(user: User) {
    const permissions = this.rolesService.resolvePermissions(user);
    return {
      id: user.id,
      email: user.email,
      role: user.role?.id ?? '',
      permissions,
    };
  }
}
