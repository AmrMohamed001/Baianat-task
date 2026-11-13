import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVendors1794598700516 implements MigrationInterface {
    name = 'CreateVendors1794598700516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sys_vendors_status_enum" AS ENUM('Pending', 'Verified', 'Rejected')`);
        await queryRunner.query(`CREATE TABLE "sys_vendors" ("id" SERIAL NOT NULL, "ownerId" integer NOT NULL, "storeName" character varying(60) NOT NULL, "description" character varying(500), "status" "public"."sys_vendors_status_enum" NOT NULL DEFAULT 'Pending', "commissionRate" numeric(5,2) NOT NULL DEFAULT '10', "approvedBy" integer, "approvedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_eeabe381bb99d688629db8ae79" UNIQUE ("ownerId"), CONSTRAINT "PK_268bdbbf191fac57c0dc93b513d" PRIMARY KEY ("id"))`);
        // Hand-added: store names are unique ignoring case. TypeORM can't express
        // an expression index in the entity, so it lives only here.
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_vendors_store_name_lower" ON "sys_vendors" (LOWER("storeName"))`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ADD CONSTRAINT "FK_eeabe381bb99d688629db8ae791" FOREIGN KEY ("ownerId") REFERENCES "sys_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ADD CONSTRAINT "FK_6970d5998c33ddc45704f57f4a8" FOREIGN KEY ("approvedBy") REFERENCES "sys_users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_vendors" DROP CONSTRAINT "FK_6970d5998c33ddc45704f57f4a8"`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" DROP CONSTRAINT "FK_eeabe381bb99d688629db8ae791"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_vendors_store_name_lower"`);
        await queryRunner.query(`DROP TABLE "sys_vendors"`);
        await queryRunner.query(`DROP TYPE "public"."sys_vendors_status_enum"`);
    }

}
