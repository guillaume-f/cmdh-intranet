import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  getAllUsers() {
    return [];
  }

  @Get(':userId')
  getUserById(@Param('userId') userId: string) {
    return {
      id: userId,
    };
  }

  @Get(':userId/validated-activities')
  getValidatedActivitiesByUserId(@Param('userId') userId: string) {
    return {
      userId,
      items: [],
      totalPoints: 0,
    };
  }

  @Patch(':userId')
  updateUser(
    @Param('userId') userId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return {
      id: userId,
      updates: payload,
    };
  }

  @Post()
  addUser(@Body() payload: Record<string, unknown>) {
    return {
      id: '',
      created: payload,
    };
  }
}
