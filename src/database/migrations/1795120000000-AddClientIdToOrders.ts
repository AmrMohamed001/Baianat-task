import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClientIdToOrders1795120000000 implements MigrationInterface {
    name = 'AddClientIdToOrders1795120000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_orders" ADD "clientId" integer`);
        await queryRunner.query(`UPDATE "sys_orders" o SET "clientId" = c."clientId" FROM "sys_checkouts" c WHERE c."id" = o."checkoutId"`);
        await queryRunner.query(`ALTER TABLE "sys_orders" ALTER COLUMN "clientId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_cfd0bbde61cacf0e941130c7c0" ON "sys_orders" ("clientId")`);
        await queryRunner.query(`ALTER TABLE "sys_orders" ADD CONSTRAINT "FK_cfd0bbde61cacf0e941130c7c09" FOREIGN KEY ("clientId") REFERENCES "sys_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_orders" DROP CONSTRAINT "FK_cfd0bbde61cacf0e941130c7c09"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cfd0bbde61cacf0e941130c7c0"`);
        await queryRunner.query(`ALTER TABLE "sys_orders" DROP COLUMN "clientId"`);
    }

}
