import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequestDto {
  @ApiProperty()
  token!: string;

  @ApiProperty()
  newPassword!: string;
}
