import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderPaymentStatus1795111336014 implements MigrationInterface {
    name = 'AddOrderPaymentStatus1795111336014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sys_orders_paymentstatus_enum" AS ENUM('Pending', 'Paid', 'Failed', 'Refunded')`);
        await queryRunner.query(`ALTER TABLE "sys_orders" ADD "paymentStatus" "public"."sys_orders_paymentstatus_enum" NOT NULL DEFAULT 'Pending'`);
        await queryRunner.query(`ALTER TABLE "sys_orders" ADD "refundedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`UPDATE "sys_orders" o SET "paymentStatus" = c."status"::text::"public"."sys_orders_paymentstatus_enum" FROM "sys_checkouts" c WHERE c."id" = o."checkoutId"`);
        await queryRunner.query(`UPDATE "sys_orders" o SET "paymentStatus" = 'Refunded', "refundedAt" = COALESCE((SELECT MIN(t."createdAt") FROM "sys_transactions" t WHERE t."orderId" = o."id" AND t."type" = 'Refund'), o."updatedAt") WHERE o."stripeRefundId" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_orders" DROP COLUMN "refundedAt"`);
        await queryRunner.query(`ALTER TABLE "sys_orders" DROP COLUMN "paymentStatus"`);
        await queryRunner.query(`DROP TYPE "public"."sys_orders_paymentstatus_enum"`);
    }

}
