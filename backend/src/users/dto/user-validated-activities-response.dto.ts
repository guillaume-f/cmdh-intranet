import { ApiProperty } from '@nestjs/swagger';
import { ValidatedActivityItemDto } from './validated-activity-item.dto';

export class UserValidatedActivitiesResponseDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ type: [ValidatedActivityItemDto] })
  items!: ValidatedActivityItemDto[];

  @ApiProperty()
  totalPoints!: number;
}
