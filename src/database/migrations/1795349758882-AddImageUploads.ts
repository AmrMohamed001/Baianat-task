import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageUploads1795349758882 implements MigrationInterface {
    name = 'AddImageUploads1795349758882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sys_product_images" ("id" SERIAL NOT NULL, "productId" integer NOT NULL, "key" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_73b8842cf82c75c4d492926d239" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c5e3e1bab92899d2a42d4bd7dc" ON "sys_product_images" ("key") `);
        await queryRunner.query(`CREATE INDEX "IDX_c397a88e3558a0128852cbe953" ON "sys_product_images" ("productId") `);
        await queryRunner.query(`ALTER TABLE "sys_users" ADD "photoKey" character varying`);
        await queryRunner.query(`ALTER TABLE "sys_product_images" ADD CONSTRAINT "FK_c397a88e3558a0128852cbe953b" FOREIGN KEY ("productId") REFERENCES "sys_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_product_images" DROP CONSTRAINT "FK_c397a88e3558a0128852cbe953b"`);
        await queryRunner.query(`ALTER TABLE "sys_users" DROP COLUMN "photoKey"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c397a88e3558a0128852cbe953"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c5e3e1bab92899d2a42d4bd7dc"`);
        await queryRunner.query(`DROP TABLE "sys_product_images"`);
    }

}
