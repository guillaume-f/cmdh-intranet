import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { MeResponseDto } from './dto/me-response.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { ResetPasswordResponseDto } from './dto/reset-password-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: LoginResponseDto })
  login(@Body() payload: LoginRequestDto): LoginResponseDto {
    return this.authService.login(payload as unknown as Record<string, unknown>);
  }

  @Post('forgot-password')
  @ApiOkResponse({ type: ForgotPasswordResponseDto })
  forgotPassword(
    @Body() payload: ForgotPasswordRequestDto,
  ): ForgotPasswordResponseDto {
    return this.authService.forgotPassword(
      payload as unknown as Record<string, unknown>,
    );
  }

  @Post('reset-password')
  @ApiOkResponse({ type: ResetPasswordResponseDto })
  resetPassword(
    @Body() payload: ResetPasswordRequestDto,
  ): ResetPasswordResponseDto {
    return this.authService.resetPassword(
      payload as unknown as Record<string, unknown>,
    );
  }

  @Get('me')
  @ApiOkResponse({ type: MeResponseDto })
  me(): MeResponseDto {
    return this.authService.me();
  }
}
