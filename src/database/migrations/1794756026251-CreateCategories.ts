import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategories1794756026251 implements MigrationInterface {
    name = 'CreateCategories1794756026251'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sys_categories" ("id" SERIAL NOT NULL, "nameAr" character varying(50) NOT NULL, "nameEn" character varying(50) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_af434c2540bbf8108265df07fef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_74465bc7660f0af62d0e0fa873" ON "sys_categories"  ("nameEn") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_13c90d87628a3fa834030e3a39" ON "sys_categories"  ("nameAr") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_13c90d87628a3fa834030e3a39"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74465bc7660f0af62d0e0fa873"`);
        await queryRunner.query(`DROP TABLE "sys_categories"`);
    }

}
