import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveExpiredPaymentStatus1795110667430 implements MigrationInterface {
    name = 'RemoveExpiredPaymentStatus1795110667430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9bc509876d3b232194cfb18d24"`); 
        await queryRunner.query(`ALTER TYPE "public"."sys_checkouts_status_enum" RENAME TO "sys_checkouts_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."sys_checkouts_status_enum" AS ENUM('Pending', 'Paid', 'Failed', 'Refunded')`);
        await queryRunner.query(`ALTER TABLE "sys_checkouts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sys_checkouts" ALTER COLUMN "status" TYPE "public"."sys_checkouts_status_enum" USING "status"::"text"::"public"."sys_checkouts_status_enum"`);
        await queryRunner.query(`ALTER TABLE "sys_checkouts" ALTER COLUMN "status" SET DEFAULT 'Pending'`);
        await queryRunner.query(`DROP TYPE "public"."sys_checkouts_status_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9bc509876d3b232194cfb18d24" ON "sys_checkouts" ("clientId") WHERE "status" = 'Pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9bc509876d3b232194cfb18d24"`); 
        await queryRunner.query(`CREATE TYPE "public"."sys_checkouts_status_enum_old" AS ENUM('Pending', 'Paid', 'Failed', 'Expired', 'Refunded')`);
        await queryRunner.query(`ALTER TABLE "sys_checkouts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sys_checkouts" ALTER COLUMN "status" TYPE "public"."sys_checkouts_status_enum_old" USING "status"::"text"::"public"."sys_checkouts_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "sys_checkouts" ALTER COLUMN "status" SET DEFAULT 'Pending'`);
        await queryRunner.query(`DROP TYPE "public"."sys_checkouts_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."sys_checkouts_status_enum_old" RENAME TO "sys_checkouts_status_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9bc509876d3b232194cfb18d24" ON "sys_checkouts" ("clientId") WHERE "status" = 'Pending'`);
    }

}
