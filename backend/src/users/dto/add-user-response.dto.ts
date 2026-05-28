import { ApiProperty } from '@nestjs/swagger';

export class AddUserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  created!: Record<string, unknown>;
}
