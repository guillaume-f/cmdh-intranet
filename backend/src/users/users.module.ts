import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceValidation } from '../activities/entities/attendance-validation.entity';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { SelfOrPermissionGuard } from '../auth/guards/self-or-permission.guard';
import { RolesModule } from '../roles/roles.module';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AttendanceValidation]),
    RolesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, PermissionsGuard, SelfOrPermissionGuard],
  exports: [UsersService],
})
export class UsersModule {}
