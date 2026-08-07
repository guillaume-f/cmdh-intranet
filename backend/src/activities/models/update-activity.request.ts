import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ActivityStatus } from '../enums/activity-status.enum';

export class UpdateActivityRequest {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  datetime!: Date;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  points!: number;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  requiresRegistration!: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  requiresAttendanceValidation!: boolean;

  @ApiPropertyOptional({ enum: ActivityStatus })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status!: ActivityStatus;
}
