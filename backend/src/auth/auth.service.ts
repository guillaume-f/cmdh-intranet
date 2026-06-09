import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto } from 'src/models/auth/forgot-password.dto';
import { ForgotPasswordRequest } from 'src/models/auth/forgot-password.request';
import { LoginDto } from 'src/models/auth/login.dto';
import { LoginRequest } from 'src/models/auth/login.request';
import { MeDto } from 'src/models/auth/me.dto';
import { ResetPasswordDto } from 'src/models/auth/reset-password.dto';
import { ResetPasswordRequest } from 'src/models/auth/reset-password.request';
import { RolesService } from '../roles/roles.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: LoginRequest): Promise<LoginDto> {
    const { email, password } = payload;

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

  forgotPassword(payload: ForgotPasswordRequest): ForgotPasswordDto {
    return {
      message: 'If this email exists, a reset link has been sent.',
    };
  }

  resetPassword(payload: ResetPasswordRequest): ResetPasswordDto {
    return {
      message: 'Password updated successfully.',
    };
  }

  me(user: User): MeDto {
    const permissions = this.rolesService.resolvePermissions(user);
    return {
      id: user.id,
      role: user.role?.id ?? '',
      permissions,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
