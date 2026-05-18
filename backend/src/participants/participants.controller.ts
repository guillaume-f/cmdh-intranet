import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

@Controller('activities/:activityId/participants')
export class ParticipantsController {
  @Get()
  getActivityParticipants(@Param('activityId') activityId: string) {
    return {
      activityId,
      participants: [],
    };
  }

  @Post(':userId/validate')
  validateParticipantPresence(
    @Param('activityId') activityId: string,
    @Param('userId') userId: string,
  ) {
    return {
      message: 'Presence validated.',
      activityId,
      userId,
      isPresent: true,
    };
  }

  @Post(':userId/invalidate')
  invalidateParticipantPresence(
    @Param('activityId') activityId: string,
    @Param('userId') userId: string,
  ) {
    return {
      message: 'Absence validated.',
      activityId,
      userId,
      isPresent: false,
    };
  }

  @Delete(':userId')
  deleteParticipantRegistration(
    @Param('activityId') activityId: string,
    @Param('userId') userId: string,
  ) {
    return {
      message: 'Registration deleted.',
      activityId,
      userId,
    };
  }

  @Post('bulk-add')
  addParticipantsWithPresence(
    @Param('activityId') activityId: string,
    @Body() payload: { userIds?: string[] },
  ) {
    return {
      message: 'Participants added and marked as present.',
      activityId,
      addedUserIds: payload.userIds ?? [],
    };
  }
}
