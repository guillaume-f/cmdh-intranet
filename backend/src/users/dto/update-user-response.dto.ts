import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserResponseDto {
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
  extraPermissions!: string[];

  @ApiProperty({ type: [String] })
  deniedPermissions!: string[];

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  niss!: string;

  @ApiProperty({ required: false, nullable: true })
  entryYear!: number | null;

  @ApiProperty({ type: [String] })
  permissions!: string[];
}
