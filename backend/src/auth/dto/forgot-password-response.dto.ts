import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty()
  message!: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  request!: Record<string, unknown>;

  @ApiProperty()
  resetTokenPreview!: string;
}
