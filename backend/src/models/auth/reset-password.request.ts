import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequest {
  @ApiProperty()
  token!: string;

  @ApiProperty()
  newPassword!: string;
}
