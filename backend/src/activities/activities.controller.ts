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
}
