import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCartItems1794845883037 implements MigrationInterface {
    name = 'CreateCartItems1794845883037'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sys_cart_items" ("id" SERIAL NOT NULL, "cartId" integer NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_241efb034a5034fe91eda89adc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3b550a20b387ca4d8bcc0c7d56" ON "sys_cart_items"  ("productId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cc654db78c4b1514c9c84b9dbe" ON "sys_cart_items"  ("cartId", "productId") `);
        await queryRunner.query(`ALTER TABLE "sys_cart_items" ADD CONSTRAINT "FK_1d0b251d15f4b29d0f525186965" FOREIGN KEY ("cartId") REFERENCES "sys_carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_cart_items" ADD CONSTRAINT "FK_3b550a20b387ca4d8bcc0c7d566" FOREIGN KEY ("productId") REFERENCES "sys_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_cart_items" DROP CONSTRAINT "FK_3b550a20b387ca4d8bcc0c7d566"`);
        await queryRunner.query(`ALTER TABLE "sys_cart_items" DROP CONSTRAINT "FK_1d0b251d15f4b29d0f525186965"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cc654db78c4b1514c9c84b9dbe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3b550a20b387ca4d8bcc0c7d56"`);
        await queryRunner.query(`DROP TABLE "sys_cart_items"`);
    }

}
