import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFullnameToUsers1794486851586 implements MigrationInterface {
    name = 'AddFullnameToUsers1794486851586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add as nullable first so existing rows do not break the NOT NULL rule,
        // fill them from the username, then make the column required.
        await queryRunner.query(`ALTER TABLE "sys_users" ADD "fullname" character varying`);
        await queryRunner.query(`UPDATE "sys_users" SET "fullname" = "username" WHERE "fullname" IS NULL`);
        await queryRunner.query(`ALTER TABLE "sys_users" ALTER COLUMN "fullname" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_users" DROP COLUMN "fullname"`);
    }

}
