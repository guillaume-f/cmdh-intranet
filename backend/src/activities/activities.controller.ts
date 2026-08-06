import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ActivityDto } from 'src/models/activities/activity.dto';
import { CreateActivityDto } from 'src/models/activities/create-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { ActivitiesService } from './activities.service';

@ApiTags('activities')
@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOkResponse({ type: [ActivityDto] })
  async getAllActivities(): Promise<ActivityDto[]> {
    const activities = await this.activitiesService.findAll();
    return activities as ActivityDto[];
  }

  @Post()
  @ApiCreatedResponse({ type: ActivityDto })
  async createActivity(
    @Body() activityDto: CreateActivityDto,
    @Request() req: { user: User },
  ): Promise<ActivityDto> {
    const activity = await this.activitiesService.create(
      activityDto,
      req.user.id,
    );
    return activity as ActivityDto;
  }

  @Get(':activityId')
  @ApiOkResponse({ type: ActivityDto })
  async getActivityById(
    @Param('activityId') activityId: string,
    @Request() req: { user: User },
  ): Promise<ActivityDto> {
    const activity = await this.activitiesService.findByIdWithRegistration(
      activityId,
      req.user.id,
    );
    return activity as ActivityDto;
  }

  @Delete(':activityId')
  async deleteActivity(@Param('activityId') activityId: string) {
    await this.activitiesService.deleteActivity(activityId);
    return { message: 'Activity deleted.', activityId };
  }

  @Get(':activityId/participants')
  async getActivityParticipants(@Param('activityId') activityId: string) {
    const participants =
      await this.activitiesService.getParticipants(activityId);
    return participants;
  }

  @Post(':activityId/participants/:userId/validate')
  async validateParticipantPresence(
    @Param('activityId') activityId: string,
    @Param('userId') userId: string,
  ) {
    await this.activitiesService.validatePresence(activityId, userId, true);
    return {
      message: 'Presence validated.',
      activityId,
      userId,
      isPresent: true,
    };
  }

  @Post(':activityId/participants/:userId/invalidate')
  async invalidateParticipantPresence(
    @Param('activityId') activityId: string,
    @Param('userId') userId: string,
  ) {
    await this.activitiesService.validatePresence(activityId, userId, false);
    return {
      message: 'Absence validated.',
      activityId,
      userId,
      isPresent: false,
    };
  }

  @Delete(':activityId/participants/:userId')
  async deleteParticipantRegistration(
    @Param('activityId') activityId: string,
    @Param('userId') userId: string,
  ) {
    await this.activitiesService.deleteParticipant(activityId, userId);
    return { message: 'Registration deleted.', activityId, userId };
  }

  @Post(':activityId/participants/bulk-add')
  async addParticipantsWithPresence(
    @Param('activityId') activityId: string,
    @Body() payload: { userIds?: string[] },
  ) {
    const userIds = payload.userIds ?? [];
    await this.activitiesService.bulkAddParticipants(activityId, userIds);
    return {
      message: 'Participants added and marked as present.',
      activityId,
      addedUserIds: userIds,
    };
  }

  @Post(':activityId/register')
  async register(
    @Param('activityId') activityId: string,
    @Request() req: { user: User },
  ) {
    const registration = await this.activitiesService.register(
      activityId,
      req.user.id,
    );
    return {
      message: 'Registration confirmed.',
      activityId,
      userId: req.user.id,
      registrationId: registration.id,
      registeredAt: registration.registeredAt,
    };
  }

  @Post(':activityId/unregister')
  async unregister(
    @Param('activityId') activityId: string,
    @Request() req: { user: User },
  ) {
    await this.activitiesService.unregister(activityId, req.user.id);
    return {
      message: 'Unregistered successfully.',
      activityId,
      userId: req.user.id,
    };
  }
}
