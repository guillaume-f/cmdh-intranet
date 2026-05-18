import { Module } from '@nestjs/common';
import { ActivitiesModule } from './activities/activities.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule, ActivitiesModule],
})
export class AppModule {}
