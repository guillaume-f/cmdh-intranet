import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowNullUserPassword1788000000000 implements MigrationInterface {
  name = 'AllowNullUserPassword1788000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` MODIFY COLUMN `password` varchar(255) NULL',
    );
    await queryRunner.query(
      "UPDATE `users` SET `password` = NULL, `active` = 0 WHERE `password` = ''",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE `users` SET `password` = '' WHERE `password` IS NULL",
    );
    await queryRunner.query(
      'ALTER TABLE `users` MODIFY COLUMN `password` varchar(255) NOT NULL',
    );
  }
}
