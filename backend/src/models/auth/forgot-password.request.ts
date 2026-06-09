import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordRequest {
  @ApiProperty()
  email!: string;
}
