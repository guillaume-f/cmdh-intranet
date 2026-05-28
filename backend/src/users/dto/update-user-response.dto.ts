import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  found!: boolean;

  @ApiProperty({ type: 'object', additionalProperties: true })
  updates!: Record<string, unknown>;
}
