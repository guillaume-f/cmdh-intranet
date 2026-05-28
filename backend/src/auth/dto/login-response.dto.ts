import { ApiProperty } from '@nestjs/swagger';
import { AuthUserDto } from './auth-user.dto';

export class LoginResponseDto {
  @ApiProperty()
  token!: string;

  @ApiProperty({ type: AuthUserDto, required: false, nullable: true })
  user!: AuthUserDto | null;

  @ApiProperty({ required: false })
  message?: string;
}
