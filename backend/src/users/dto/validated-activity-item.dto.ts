import { ApiProperty } from '@nestjs/swagger';

export class ValidatedActivityItemDto {
  @ApiProperty()
  validationId!: string;

  @ApiProperty()
  activityId!: string;

  @ApiProperty()
  activityTitle!: string;

  @ApiProperty()
  points!: number;

  @ApiProperty()
  validatedAt!: string;

  @ApiProperty()
  validatedBy!: string;
}
