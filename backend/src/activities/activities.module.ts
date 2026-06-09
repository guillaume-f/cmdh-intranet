import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Activity } from './entities/activity.entity';
import { AttendanceValidation } from './entities/attendance-validation.entity';
import { Registration } from './entities/registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, Registration, AttendanceValidation])],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
