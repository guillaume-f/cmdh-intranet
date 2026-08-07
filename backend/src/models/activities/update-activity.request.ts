import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityStatus } from 'src/activities/entities/activity.entity';

export class UpdateActivityRequest {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  datetime?: Date;

  @ApiPropertyOptional()
  points?: number;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional({ default: false })
  requiresRegistration?: boolean;

  @ApiPropertyOptional({ default: false })
  requiresAttendanceValidation?: boolean;

  @ApiPropertyOptional({ enum: ActivityStatus })
  status?: ActivityStatus;
}
