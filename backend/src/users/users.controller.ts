import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AddUserResponseDto } from './dto/add-user-response.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';
import { UserByIdResponseDto } from './dto/user-by-id-response.dto';
import { UserPayloadDto } from './dto/user-payload.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserValidatedActivitiesResponseDto } from './dto/user-validated-activities-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: [UserResponseDto] })
  getAllUsers(): UserResponseDto[] {
    return this.usersService.getAllUsers();
  }

  @Get(':userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ type: UserByIdResponseDto })
  getUserById(@Param('userId') userId: string): UserByIdResponseDto {
    return this.usersService.getUserById(userId);
  }

  @Get(':userId/validated-activities')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ type: UserValidatedActivitiesResponseDto })
  getValidatedActivitiesByUserId(
    @Param('userId') userId: string,
  ): UserValidatedActivitiesResponseDto {
    return this.usersService.getValidatedActivitiesByUserId(userId);
  }

  @Patch(':userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ type: UpdateUserResponseDto })
  updateUser(
    @Param('userId') userId: string,
    @Body() payload: UserPayloadDto,
  ): UpdateUserResponseDto {
    return this.usersService.updateUser(
      userId,
      payload as unknown as Record<string, unknown>,
    );
  }

  @Post()
  @ApiCreatedResponse({ type: AddUserResponseDto })
  addUser(@Body() payload: UserPayloadDto): AddUserResponseDto {
    return this.usersService.addUser(payload as unknown as Record<string, unknown>);
  }
}
