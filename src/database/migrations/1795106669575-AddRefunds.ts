import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefunds1795106669575 implements MigrationInterface {
    name = 'AddRefunds1795106669575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_orders" ADD "stripeRefundId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "sys_transactions" ADD "stripeRefundId" character varying(255)`);
        await queryRunner.query(`ALTER TYPE "public"."sys_checkouts_status_enum" ADD VALUE 'Refunded'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sys_checkouts_status_enum_old" AS ENUM('Pending', 'Paid', 'Failed', 'Expired')`);
        await queryRunner.query(`ALTER TABLE "sys_checkouts" ALTER COLUMN "status" TYPE "public"."sys_checkouts_status_enum_old" USING "status"::"text"::"public"."sys_checkouts_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."sys_checkouts_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."sys_checkouts_status_enum_old" RENAME TO "sys_checkouts_status_enum"`);
        await queryRunner.query(`ALTER TABLE "sys_transactions" DROP COLUMN "stripeRefundId"`);
        await queryRunner.query(`ALTER TABLE "sys_orders" DROP COLUMN "stripeRefundId"`);
    }

}
