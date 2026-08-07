import { ApiProperty } from '@nestjs/swagger';

export class AttendanceValidationDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  isPresent!: boolean | null;

  @ApiProperty()
  presenceValidatedAt!: Date | null;
}
