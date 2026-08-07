import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request as ExpressRequest, Response } from 'express';
import { ForgotPasswordDto } from 'src/models/auth/forgot-password.dto';
import { ForgotPasswordRequest } from 'src/models/auth/forgot-password.request';
import { LoginDto } from 'src/models/auth/login.dto';
import { LoginRequest } from 'src/models/auth/login.request';
import { MeDto } from 'src/models/auth/me.dto';
import { RefreshDto } from 'src/models/auth/refresh.dto';
import { ResetPasswordDto } from 'src/models/auth/reset-password.dto';
import { ResetPasswordRequest } from 'src/models/auth/reset-password.request';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const REFRESH_COOKIE_NAME = 'refresh_token';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: LoginDto })
  async login(
    @Body() payload: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginDto> {
    const result = await this.authService.login(payload);
    this.setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    return result.loginDto;
  }

  @Post('refresh')
  @ApiOkResponse({ type: RefreshDto })
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshDto> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as
      | string
      | undefined;
    const result = await this.authService.refresh(refreshToken);
    this.setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    return { token: result.token };
  }

  @Post('logout')
  @ApiOkResponse({ schema: { example: { success: true } } })
  async logout(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean }> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as
      | string
      | undefined;
    await this.authService.logout(refreshToken);
    this.clearRefreshCookie(res);
    return { success: true };
  }

  @Post('forgot-password')
  @ApiOkResponse({ type: ForgotPasswordDto })
  forgotPassword(@Body() payload: ForgotPasswordRequest): ForgotPasswordDto {
    return this.authService.forgotPassword(payload);
  }

  @Post('reset-password')
  @ApiOkResponse({ type: ResetPasswordDto })
  resetPassword(@Body() payload: ResetPasswordRequest): ResetPasswordDto {
    return this.authService.resetPassword(payload);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: MeDto })
  me(@Request() req: { user: User }): MeDto {
    return this.authService.me(req.user);
  }

  private setRefreshCookie(
    res: Response,
    refreshToken: string,
    refreshExpiresAt: Date,
  ): void {
    const maxAge = Math.max(0, refreshExpiresAt.getTime() - Date.now());
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
    });
  }
}
