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
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { SelfOrPermission } from '../auth/decorators/self-or-permission.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { SelfOrPermissionGuard } from '../auth/guards/self-or-permission.guard';
import { AddUserResponseDto } from './dto/add-user-response.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';
import { UserByIdResponseDto } from './dto/user-by-id-response.dto';
import { UserPayloadDto } from './dto/user-payload.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserValidatedActivitiesResponseDto } from './dto/user-validated-activities-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: [UserResponseDto] })
  @Permissions(PERMISSIONS.USER_MANAGE)
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.usersService.getAllUsers();
  }

  @Get(':userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ type: UserByIdResponseDto })
  @SelfOrPermission('userId', PERMISSIONS.USER_MANAGE)
  @UseGuards(SelfOrPermissionGuard)
  async getUserById(
    @Param('userId') userId: string,
  ): Promise<UserByIdResponseDto> {
    return this.usersService.getUserById(userId);
  }

  @Get(':userId/validated-activities')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ type: UserValidatedActivitiesResponseDto })
  @SelfOrPermission('userId', PERMISSIONS.USER_MANAGE)
  @UseGuards(SelfOrPermissionGuard)
  async getValidatedActivitiesByUserId(
    @Param('userId') userId: string,
  ): Promise<UserValidatedActivitiesResponseDto> {
    return this.usersService.getValidatedActivitiesByUserId(userId);
  }

  @Patch(':userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ type: UpdateUserResponseDto })
  @Permissions(PERMISSIONS.USER_MANAGE)
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
  @Permissions(PERMISSIONS.USER_MANAGE)
  async addUser(@Body() payload: UserPayloadDto): Promise<AddUserResponseDto> {
    return this.usersService.addUser(
      payload as unknown as Record<string, unknown>,
    );
  }
}
