import { ApiProperty } from '@nestjs/swagger';
import { ActivityStatus } from 'src/activities/entities/activity.entity';

export class CreateActivityRequest {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  datetime!: Date;

  @ApiProperty()
  points!: number;

  @ApiProperty()
  location!: string;

  @ApiProperty({ required: false, default: false })
  requiresRegistration?: boolean;

  @ApiProperty({ required: false, default: false })
  requiresAttendanceValidation?: boolean;

  @ApiProperty({ required: false, default: ActivityStatus.DRAFT })
  status?: ActivityStatus;
}
