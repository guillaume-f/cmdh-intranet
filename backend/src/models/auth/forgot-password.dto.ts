import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty()
  message!: string;

  @ApiProperty({ type: 'object', additionalProperties: true, nullable: true })
  request?: Record<string, unknown>;
}
