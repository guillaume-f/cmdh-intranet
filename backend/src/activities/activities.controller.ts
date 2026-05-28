import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { ActivityDto } from './activity.dto';

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOkResponse({ type: [ActivityDto] })
  getAllActivities(): ActivityDto[] {
    return this.activitiesService.findAll();
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
