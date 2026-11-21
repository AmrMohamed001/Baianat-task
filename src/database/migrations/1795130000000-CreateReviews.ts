import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReviews1795130000000 implements MigrationInterface {
    name = 'CreateReviews1795130000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sys_reviews" ("id" SERIAL NOT NULL, "clientId" integer NOT NULL, "vendorId" integer NOT NULL, "rating" smallint NOT NULL, "comment" character varying(1000), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_dbcc0ce3a24bc17c7da9ef4ce24" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e76bb8eb21eed547fd63f3b091" ON "sys_reviews" ("clientId", "vendorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ffd79c091e35f4e167da945dd6" ON "sys_reviews" ("vendorId") `);
        await queryRunner.query(`ALTER TABLE "sys_reviews" ADD CONSTRAINT "FK_f210c28ba60174acc938d07c309" FOREIGN KEY ("clientId") REFERENCES "sys_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_reviews" ADD CONSTRAINT "FK_ffd79c091e35f4e167da945dd6b" FOREIGN KEY ("vendorId") REFERENCES "sys_vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_reviews" DROP CONSTRAINT "FK_ffd79c091e35f4e167da945dd6b"`);
        await queryRunner.query(`ALTER TABLE "sys_reviews" DROP CONSTRAINT "FK_f210c28ba60174acc938d07c309"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ffd79c091e35f4e167da945dd6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e76bb8eb21eed547fd63f3b091"`);
        await queryRunner.query(`DROP TABLE "sys_reviews"`);
    }

}
