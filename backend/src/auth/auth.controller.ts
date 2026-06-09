import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto } from 'src/models/auth/forgot-password.dto';
import { ForgotPasswordRequest } from 'src/models/auth/forgot-password.request';
import { LoginDto } from 'src/models/auth/login.dto';
import { LoginRequest } from 'src/models/auth/login.request';
import { MeDto } from 'src/models/auth/me.dto';
import { ResetPasswordDto } from 'src/models/auth/reset-password.dto';
import { ResetPasswordRequest } from 'src/models/auth/reset-password.request';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: LoginDto })
  async login(@Body() payload: LoginRequest): Promise<LoginDto> {
    return this.authService.login(payload);
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
  @ApiOkResponse({ type: MeDto })
  me(@Request() req: { user: User }): MeDto {
    return this.authService.me(req.user);
  }
}
