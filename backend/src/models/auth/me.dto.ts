import { ApiProperty } from '@nestjs/swagger';

export class MeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty({ type: [String] })
  permissions!: string[];
}
