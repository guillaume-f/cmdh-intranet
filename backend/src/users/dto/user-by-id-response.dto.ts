import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserByIdResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  found!: boolean;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  role?: string;

  @ApiPropertyOptional({ type: [String] })
  extraPermissions?: string[];

  @ApiPropertyOptional({ type: [String] })
  deniedPermissions?: string[];

  @ApiPropertyOptional()
  active?: boolean;

  @ApiPropertyOptional()
  niss?: string;

  @ApiPropertyOptional({ nullable: true })
  entryYear?: number | null;

  @ApiPropertyOptional({ type: [String] })
  permissions?: string[];
}
