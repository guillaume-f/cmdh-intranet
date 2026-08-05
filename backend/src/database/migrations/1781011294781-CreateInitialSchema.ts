import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1781011294781 implements MigrationInterface {
  name = 'CreateInitialSchema1781011294781';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const existingRoles = await queryRunner.query(
      "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'roles' LIMIT 1",
    );

    // If the schema already exists (e.g. created manually or via sync),
    // skip creation so this migration can be marked as executed.
    if (existingRoles.length > 0) {
      return;
    }

    await queryRunner.query(
      `CREATE TABLE \`roles\` (\`id\` varchar(50) NOT NULL, \`label\` varchar(100) NOT NULL, \`permissions\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`firstName\` varchar(100) NOT NULL, \`lastName\` varchar(100) NOT NULL, \`extraPermissions\` text NOT NULL, \`deniedPermissions\` text NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`niss\` varchar(20) NOT NULL, \`entryYear\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`roleId\` varchar(50) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`activities\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`datetime\` timestamp NOT NULL, \`points\` int NOT NULL DEFAULT '0', \`location\` varchar(255) NOT NULL, \`status\` enum ('draft', 'published') NOT NULL DEFAULT 'draft', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`requiresAttendanceValidation\` tinyint NOT NULL DEFAULT 0, \`requiresRegistration\` tinyint NOT NULL DEFAULT 0, \`createdById\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`registrations\` (\`id\` varchar(36) NOT NULL, \`registeredAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`activityId\` varchar(36) NULL, \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`attendance_validations\` (\`id\` varchar(36) NOT NULL, \`isPresent\` tinyint NOT NULL, \`validatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`activityId\` varchar(36) NULL, \`userId\` varchar(36) NULL, \`validatedById\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_368e146b785b574f42ae9e53d5e\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activities\` ADD CONSTRAINT \`FK_579056df0c92b0f6432e96b2048\` FOREIGN KEY (\`createdById\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`registrations\` ADD CONSTRAINT \`FK_cb795e4cc8e9c1ca37687b275fb\` FOREIGN KEY (\`activityId\`) REFERENCES \`activities\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`registrations\` ADD CONSTRAINT \`FK_7e5ae7aa55bb98b8b9dcbe32ca3\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`attendance_validations\` ADD CONSTRAINT \`FK_b021eef03e5352a82a8b41a8eb6\` FOREIGN KEY (\`activityId\`) REFERENCES \`activities\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`attendance_validations\` ADD CONSTRAINT \`FK_36bbf2bfed5771a91edee5fb6d3\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`attendance_validations\` ADD CONSTRAINT \`FK_66b798fa0d757e0b6d503b0b13e\` FOREIGN KEY (\`validatedById\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`attendance_validations\` DROP FOREIGN KEY \`FK_66b798fa0d757e0b6d503b0b13e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`attendance_validations\` DROP FOREIGN KEY \`FK_36bbf2bfed5771a91edee5fb6d3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`attendance_validations\` DROP FOREIGN KEY \`FK_b021eef03e5352a82a8b41a8eb6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`registrations\` DROP FOREIGN KEY \`FK_7e5ae7aa55bb98b8b9dcbe32ca3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`registrations\` DROP FOREIGN KEY \`FK_cb795e4cc8e9c1ca37687b275fb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`activities\` DROP FOREIGN KEY \`FK_579056df0c92b0f6432e96b2048\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_368e146b785b574f42ae9e53d5e\``,
    );
    await queryRunner.query(`DROP TABLE \`attendance_validations\``);
    await queryRunner.query(`DROP TABLE \`registrations\``);
    await queryRunner.query(`DROP TABLE \`activities\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`roles\``);
  }
}
