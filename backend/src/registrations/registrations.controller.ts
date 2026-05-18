import { Controller, Param, Post } from '@nestjs/common';

@Controller('activities/:activityId')
export class RegistrationsController {
  @Post('register')
  register(@Param('activityId') activityId: string) {
    return {
      message: 'Registration confirmed.',
      activityId,
    };
  }

  @Post('unregister')
  unregister(@Param('activityId') activityId: string) {
    return {
      message: 'Unregistered successfully.',
      activityId,
    };
  }
}
