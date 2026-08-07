import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateActivityRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  datetime!: Date;

  @ApiProperty()
  @IsInt()
  @Min(0)
  points!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  requiresRegistration?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  requiresAttendanceValidation?: boolean;

  @ApiPropertyOptional({ default: ActivityStatus.DRAFT })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;
}
