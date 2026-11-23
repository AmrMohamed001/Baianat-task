import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWishlistItems1795399575721 implements MigrationInterface {
    name = 'CreateWishlistItems1795399575721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sys_wishlist_items" ("id" SERIAL NOT NULL, "clientId" integer NOT NULL, "productId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8ea6702c9d091a2a50e0e419b68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_767a63ac69506bee01384bde7c" ON "sys_wishlist_items"  ("clientId", "productId") `);
        await queryRunner.query(`ALTER TABLE "sys_wishlist_items" ADD CONSTRAINT "FK_60efe9655419ac115e9746fffd2" FOREIGN KEY ("clientId") REFERENCES "sys_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_wishlist_items" ADD CONSTRAINT "FK_a7a40f25bc4619eeb8b7de818d1" FOREIGN KEY ("productId") REFERENCES "sys_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_wishlist_items" DROP CONSTRAINT "FK_a7a40f25bc4619eeb8b7de818d1"`);
        await queryRunner.query(`ALTER TABLE "sys_wishlist_items" DROP CONSTRAINT "FK_60efe9655419ac115e9746fffd2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_767a63ac69506bee01384bde7c"`);
        await queryRunner.query(`DROP TABLE "sys_wishlist_items"`);
    }

}
