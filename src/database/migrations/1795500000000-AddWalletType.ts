import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWalletType1795500000000 implements MigrationInterface {
    name = 'AddWalletType1795500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sys_wallets_type_enum" AS ENUM('Vendor', 'Platform')`);
        await queryRunner.query(`ALTER TABLE "sys_wallets" ADD "type" "public"."sys_wallets_type_enum" NOT NULL DEFAULT 'Vendor'`);
        await queryRunner.query(`UPDATE "sys_wallets" SET "type" = 'Platform' WHERE "userId" = (SELECT MIN("id") FROM "sys_users" WHERE "role" = 'Super Admin')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_wallets" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."sys_wallets_type_enum"`);
    }

}
