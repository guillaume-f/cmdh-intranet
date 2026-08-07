import { ApiProperty } from '@nestjs/swagger';

export class ActivityDto {
  @ApiProperty()
  id!: string;

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

  @ApiProperty()
  requiresRegistration!: boolean;

  @ApiProperty()
  requiresAttendanceValidation!: boolean;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdById!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  isRegistered!: boolean;

  @ApiProperty({ required: false, nullable: true })
  registeredAt?: Date | null;
}
