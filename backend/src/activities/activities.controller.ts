import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

@Controller('activities')
export class ActivitiesController {
  @Get()
  getAllActivities() {
    return [];
  }

  @Get(':activityId')
  getActivityById(@Param('activityId') activityId: string) {
    return {
      id: activityId,
    };
  }

  @Post()
  addActivity(@Body() payload: Record<string, unknown>) {
    return {
      id: '',
      created: payload,
    };
  }

  @Patch(':activityId')
  updateActivity(
    @Param('activityId') activityId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return {
      id: activityId,
      updates: payload,
    };
  }

  @Delete(':activityId')
  deleteActivity(@Param('activityId') activityId: string) {
    return {
      message: 'Activity deleted.',
      activityId,
    };
  }

  @Get(':activityId/participants')
  getActivityParticipants(@Param('activityId') activityId: string) {
    return {
      activityId,
      participants: [],
    };
  }

  @Post(':activityId/participants/:userId/validate')
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

  @Post(':activityId/participants/:userId/invalidate')
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

  @Delete(':activityId/participants/:userId')
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

  @Post(':activityId/participants/bulk-add')
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

  @Post(':activityId/register')
  register(@Param('activityId') activityId: string) {
    return {
      message: 'Registration confirmed.',
      activityId,
    };
  }

  @Post(':activityId/unregister')
  unregister(@Param('activityId') activityId: string) {
    return {
      message: 'Unregistered successfully.',
      activityId,
    };
  }
}
