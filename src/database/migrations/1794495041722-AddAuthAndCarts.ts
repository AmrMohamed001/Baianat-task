import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthAndCarts1794495041722 implements MigrationInterface {
    name = 'AddAuthAndCarts1794495041722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sys_carts" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_7fa8a814ca8f192a8b06fc9ffb" UNIQUE ("userId"), CONSTRAINT "PK_86e073196c14a1210bf387b632a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sys_users" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "sys_carts" ADD CONSTRAINT "FK_7fa8a814ca8f192a8b06fc9ffbd" FOREIGN KEY ("userId") REFERENCES "sys_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_carts" DROP CONSTRAINT "FK_7fa8a814ca8f192a8b06fc9ffbd"`);
        await queryRunner.query(`ALTER TABLE "sys_users" DROP COLUMN "isActive"`);
        await queryRunner.query(`DROP TABLE "sys_carts"`);
    }

}
