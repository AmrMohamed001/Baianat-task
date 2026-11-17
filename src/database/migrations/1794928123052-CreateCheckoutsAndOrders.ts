import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCheckoutsAndOrders1794928123052 implements MigrationInterface {
    name = 'CreateCheckoutsAndOrders1794928123052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sys_order_items" ("id" SERIAL NOT NULL, "orderId" integer NOT NULL, "productId" integer, "nameAr" character varying(120) NOT NULL, "nameEn" character varying(120) NOT NULL, "priceAtPurchase" bigint NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_90c79939315311b68f452f85251" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_78c1ac1ff43da599375e4af1d5" ON "sys_order_items"  ("orderId") `);
        await queryRunner.query(`CREATE TYPE "public"."sys_orders_status_enum" AS ENUM('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled')`);
        await queryRunner.query(`CREATE TABLE "sys_orders" ("id" SERIAL NOT NULL, "checkoutId" integer NOT NULL, "vendorId" integer NOT NULL, "total" bigint NOT NULL, "commissionAmount" bigint NOT NULL, "status" "public"."sys_orders_status_enum" NOT NULL DEFAULT 'Pending', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_075448fdb04207aed2ac0e56829" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ef7b1b105530d71e8b15a57145" ON "sys_orders"  ("vendorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_58be6ee89de6eeb9661c52fa53" ON "sys_orders"  ("checkoutId") `);
        await queryRunner.query(`CREATE TYPE "public"."sys_checkouts_status_enum" AS ENUM('Pending', 'Paid', 'Failed', 'Expired')`);
        await queryRunner.query(`CREATE TABLE "sys_checkouts" ("id" SERIAL NOT NULL, "clientId" integer NOT NULL, "total" bigint NOT NULL, "status" "public"."sys_checkouts_status_enum" NOT NULL DEFAULT 'Pending', "paymentIntentId" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6e7948d905ead07a6f67625d92e" UNIQUE ("paymentIntentId"), CONSTRAINT "PK_d6a870562ccad3972d539cc09a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9bc509876d3b232194cfb18d24" ON "sys_checkouts"  ("clientId") WHERE "status" = 'Pending'`);
        await queryRunner.query(`ALTER TABLE "sys_order_items" ADD CONSTRAINT "FK_78c1ac1ff43da599375e4af1d56" FOREIGN KEY ("orderId") REFERENCES "sys_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_order_items" ADD CONSTRAINT "FK_5c27bbdfd791c4bcc31cf3382bb" FOREIGN KEY ("productId") REFERENCES "sys_products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_orders" ADD CONSTRAINT "FK_58be6ee89de6eeb9661c52fa537" FOREIGN KEY ("checkoutId") REFERENCES "sys_checkouts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_orders" ADD CONSTRAINT "FK_ef7b1b105530d71e8b15a571453" FOREIGN KEY ("vendorId") REFERENCES "sys_vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_checkouts" ADD CONSTRAINT "FK_1ea1791047cae3180018db9b80c" FOREIGN KEY ("clientId") REFERENCES "sys_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_checkouts" DROP CONSTRAINT "FK_1ea1791047cae3180018db9b80c"`);
        await queryRunner.query(`ALTER TABLE "sys_orders" DROP CONSTRAINT "FK_ef7b1b105530d71e8b15a571453"`);
        await queryRunner.query(`ALTER TABLE "sys_orders" DROP CONSTRAINT "FK_58be6ee89de6eeb9661c52fa537"`);
        await queryRunner.query(`ALTER TABLE "sys_order_items" DROP CONSTRAINT "FK_5c27bbdfd791c4bcc31cf3382bb"`);
        await queryRunner.query(`ALTER TABLE "sys_order_items" DROP CONSTRAINT "FK_78c1ac1ff43da599375e4af1d56"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9bc509876d3b232194cfb18d24"`);
        await queryRunner.query(`DROP TABLE "sys_checkouts"`);
        await queryRunner.query(`DROP TYPE "public"."sys_checkouts_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_58be6ee89de6eeb9661c52fa53"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef7b1b105530d71e8b15a57145"`);
        await queryRunner.query(`DROP TABLE "sys_orders"`);
        await queryRunner.query(`DROP TYPE "public"."sys_orders_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78c1ac1ff43da599375e4af1d5"`);
        await queryRunner.query(`DROP TABLE "sys_order_items"`);
    }

}
