import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { SelfOrPermissionGuard } from '../auth/guards/self-or-permission.guard';
import { RolesModule } from '../roles/roles.module';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Activity } from './entities/activity.entity';
import { AttendanceValidation } from './entities/attendance-validation.entity';
import { Registration } from './entities/registration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Registration, AttendanceValidation]),
    RolesModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, PermissionsGuard, SelfOrPermissionGuard],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
