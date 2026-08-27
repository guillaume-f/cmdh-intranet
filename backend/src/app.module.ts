import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesModule } from './activities/activities.module';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './config/env.validation';
import { LoggingModule } from './logging/logging.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    LoggingModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST') as string,
        port: config.get<number>('DB_PORT') as number,
        username: config.get<string>('DB_USER') as string,
        password: config.get<string>('DB_PASSWORD') as string,
        database: config.get<string>('DB_NAME') as string,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
      }),
    }),
    RolesModule,
    AuthModule,
    UsersModule,
    ActivitiesModule,
  ],
})
export class AppModule {}
