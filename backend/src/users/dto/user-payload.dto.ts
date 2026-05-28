import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserPayloadDto {
  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  password?: string;

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
}
