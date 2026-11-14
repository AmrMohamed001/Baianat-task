import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVendorFollows1794700000001 implements MigrationInterface {
    name = 'CreateVendorFollows1794700000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_vendors" DROP CONSTRAINT "FK_6970d5998c33ddc45704f57f4a8"`);
        await queryRunner.query(`CREATE TABLE "sys_vendor_follows" ("id" SERIAL NOT NULL, "clientId" integer NOT NULL, "vendorId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9a541c486bf28f8fecdf0907410" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_514ab677776dbacde95135b226" ON "sys_vendor_follows"  ("vendorId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2610900d756d33f9f8dbceeb8f" ON "sys_vendor_follows"  ("clientId", "vendorId") `);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ADD CONSTRAINT "FK_9ca938d11fb9bcb4491a6227c6f" FOREIGN KEY ("reviewedBy") REFERENCES "sys_users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_vendor_follows" ADD CONSTRAINT "FK_45de966edbfe5f747a396de9bf0" FOREIGN KEY ("clientId") REFERENCES "sys_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_vendor_follows" ADD CONSTRAINT "FK_514ab677776dbacde95135b2261" FOREIGN KEY ("vendorId") REFERENCES "sys_vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_vendor_follows" DROP CONSTRAINT "FK_514ab677776dbacde95135b2261"`);
        await queryRunner.query(`ALTER TABLE "sys_vendor_follows" DROP CONSTRAINT "FK_45de966edbfe5f747a396de9bf0"`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" DROP CONSTRAINT "FK_9ca938d11fb9bcb4491a6227c6f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2610900d756d33f9f8dbceeb8f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_514ab677776dbacde95135b226"`);
        await queryRunner.query(`DROP TABLE "sys_vendor_follows"`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ADD CONSTRAINT "FK_6970d5998c33ddc45704f57f4a8" FOREIGN KEY ("reviewedBy") REFERENCES "sys_users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
