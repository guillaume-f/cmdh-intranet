import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
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

interface RefreshJwtPayload {
  sub: string;
  email: string;
  tokenId: string;
  type: 'refresh';
  exp?: number;
}

interface LoginResult {
  loginDto: LoginDto;
  refreshToken: string;
  refreshExpiresAt: Date;
}

interface RefreshResult {
  token: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(payload: LoginRequest): Promise<LoginResult> {
    const { email, password } = payload;

    const user = await this.usersService.findByEmail(email);

    if (!user || !user.active || !user.password) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const { token, refreshToken, refreshTokenId, refreshExpiresAt } =
      this.issueTokens(user);
    await this.usersService.setRefreshTokenSession(
      user.id,
      this.hashToken(refreshToken),
      refreshTokenId,
      refreshExpiresAt,
    );

    return {
      loginDto: {
        token,
      },
      refreshToken,
      refreshExpiresAt,
    };
  }

  async refresh(refreshToken?: string): Promise<RefreshResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token.');
    }

    let payload: RefreshJwtPayload;
    try {
      payload = this.jwtService.verify<RefreshJwtPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type.');
    }

    const user = await this.usersService.findById(payload.sub);
    if (
      !user?.refreshTokenHash ||
      !user.refreshTokenId ||
      !user.refreshTokenExpiresAt
    ) {
      throw new UnauthorizedException('Refresh session not found.');
    }

    const isExpired = user.refreshTokenExpiresAt.getTime() <= Date.now();
    const isHashMismatch =
      user.refreshTokenHash !== this.hashToken(refreshToken);
    const isTokenIdMismatch = user.refreshTokenId !== payload.tokenId;

    if (isExpired || isHashMismatch || isTokenIdMismatch) {
      await this.usersService.clearRefreshTokenSession(user.id);
      throw new UnauthorizedException('Refresh session expired or invalid.');
    }

    const nextTokens = this.issueTokens(user);
    await this.usersService.setRefreshTokenSession(
      user.id,
      this.hashToken(nextTokens.refreshToken),
      nextTokens.refreshTokenId,
      nextTokens.refreshExpiresAt,
    );

    return {
      token: nextTokens.token,
      refreshToken: nextTokens.refreshToken,
      refreshExpiresAt: nextTokens.refreshExpiresAt,
    };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = this.jwtService.verify<RefreshJwtPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
      await this.usersService.clearRefreshTokenSession(payload.sub);
    } catch {
      // Ignore malformed refresh token and always return success to caller.
    }
  }

  private issueTokens(user: User): {
    token: string;
    refreshToken: string;
    refreshTokenId: string;
    refreshExpiresAt: Date;
  } {
    const basePayload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(basePayload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiration as unknown as number,
    });

    const refreshTokenId = randomUUID();
    const refreshToken = this.jwtService.sign(
      { ...basePayload, tokenId: refreshTokenId, type: 'refresh' },
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiration as unknown as number,
      },
    );

    const decoded = this.jwtService.decode<RefreshJwtPayload>(refreshToken);
    const refreshExpiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return { token, refreshToken, refreshTokenId, refreshExpiresAt };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private get accessSecret(): string {
    return this.configService.get<string>('JWT_ACCESS_SECRET') as string;
  }

  private get refreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET') as string;
  }

  private get accessExpiration(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRATION') as string;
  }

  private get refreshExpiration(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRATION') as string;
  }

  forgotPassword(payload: ForgotPasswordRequest): ForgotPasswordDto {
    void payload;
    return {
      message: 'If this email exists, a reset link has been sent.',
    };
  }

  resetPassword(payload: ResetPasswordRequest): ResetPasswordDto {
    void payload;
    return {
      message: 'Password updated successfully.',
    };
  }

  me(user: User): MeDto {
    const permissions = this.rolesService.resolvePermissions(user);
    return {
      id: user.id,
      email: user.email,
      role: user.role?.id ?? '',
      permissions,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
