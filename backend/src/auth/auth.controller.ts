import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() payload: Record<string, unknown>) {
    return {
      token: '',
      user: {},
      request: payload,
    };
  }

  @Post('forgot-password')
  forgotPassword(@Body() payload: Record<string, unknown>) {
    return {
      message: 'If this email exists, a reset link has been sent.',
      request: payload,
    };
  }

  @Post('reset-password')
  resetPassword(@Body() payload: Record<string, unknown>) {
    return {
      message: 'Password updated successfully.',
      request: payload,
    };
  }

  @Get('me')
  me() {
    return {
      id: '',
      email: '',
      role: '',
      permissions: [],
    };
  }
}
