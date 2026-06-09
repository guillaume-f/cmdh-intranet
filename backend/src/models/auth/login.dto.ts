import { ApiProperty } from '@nestjs/swagger';
import { AuthUserDto } from './auth-user.dto';

export class LoginDto {
  @ApiProperty()
  token!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}
