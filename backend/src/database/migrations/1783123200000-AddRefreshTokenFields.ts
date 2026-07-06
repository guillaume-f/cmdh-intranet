import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenFields1783123200000 implements MigrationInterface {
  name = 'AddRefreshTokenFields1783123200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` ADD `refreshTokenHash` varchar(255) NULL, ADD `refreshTokenId` varchar(64) NULL, ADD `refreshTokenExpiresAt` datetime NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN `refreshTokenExpiresAt`, DROP COLUMN `refreshTokenId`, DROP COLUMN `refreshTokenHash`',
    );
  }
}
