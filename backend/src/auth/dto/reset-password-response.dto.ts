import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDto {
  @ApiProperty()
  message!: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  request!: Record<string, unknown>;
}
