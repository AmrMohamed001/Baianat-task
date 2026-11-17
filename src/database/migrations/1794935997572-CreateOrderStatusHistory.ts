import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderStatusHistory1794935997572 implements MigrationInterface {
    name = 'CreateOrderStatusHistory1794935997572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sys_order_status_history_status_enum" AS ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')`);
        await queryRunner.query(`CREATE TABLE "sys_order_status_history" ("id" SERIAL NOT NULL, "orderId" integer NOT NULL, "status" "public"."sys_order_status_history_status_enum" NOT NULL, "changedBy" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_784b8a1fa2a585d09d775cd4e99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8d5098939319a2b77fb8ae8610" ON "sys_order_status_history"  ("orderId") `);
        await queryRunner.query(`ALTER TABLE "sys_order_status_history" ADD CONSTRAINT "FK_8d5098939319a2b77fb8ae86104" FOREIGN KEY ("orderId") REFERENCES "sys_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_order_status_history" ADD CONSTRAINT "FK_b81ef86f2b4adb86a09c00fe20c" FOREIGN KEY ("changedBy") REFERENCES "sys_users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_order_status_history" DROP CONSTRAINT "FK_b81ef86f2b4adb86a09c00fe20c"`);
        await queryRunner.query(`ALTER TABLE "sys_order_status_history" DROP CONSTRAINT "FK_8d5098939319a2b77fb8ae86104"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8d5098939319a2b77fb8ae8610"`);
        await queryRunner.query(`DROP TABLE "sys_order_status_history"`);
        await queryRunner.query(`DROP TYPE "public"."sys_order_status_history_status_enum"`);
    }

}
