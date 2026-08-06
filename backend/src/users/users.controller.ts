import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddUserResponseDto } from './dto/add-user-response.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';
import { UserByIdResponseDto } from './dto/user-by-id-response.dto';
import { UserPayloadDto } from './dto/user-payload.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserValidatedActivitiesResponseDto } from './dto/user-validated-activities-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: [UserResponseDto] })
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.usersService.getAllUsers();
  }

  @Get(':userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ type: UserByIdResponseDto })
  async getUserById(
    @Param('userId') userId: string,
  ): Promise<UserByIdResponseDto> {
    return this.usersService.getUserById(userId);
  }

  @Get(':userId/validated-activities')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ type: UserValidatedActivitiesResponseDto })
  async getValidatedActivitiesByUserId(
    @Param('userId') userId: string,
  ): Promise<UserValidatedActivitiesResponseDto> {
    return this.usersService.getValidatedActivitiesByUserId(userId);
  }

  @Patch(':userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ type: UpdateUserResponseDto })
  async updateUser(
    @Param('userId') userId: string,
    @Body() payload: UserPayloadDto,
  ): Promise<UpdateUserResponseDto> {
    return this.usersService.updateUser(
      userId,
      payload as unknown as Record<string, unknown>,
    );
  }

  @Post()
  @ApiCreatedResponse({ type: AddUserResponseDto })
  async addUser(@Body() payload: UserPayloadDto): Promise<AddUserResponseDto> {
    return this.usersService.addUser(
      payload as unknown as Record<string, unknown>,
    );
  }
}
