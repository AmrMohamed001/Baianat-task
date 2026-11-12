import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatingUserEntity1794483783584 implements MigrationInterface {
    name = 'CreatingUserEntity1794483783584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sys_users_role_enum" AS ENUM('Super Admin', 'Client', 'Vendor')`);
        await queryRunner.query(`CREATE TABLE "sys_users" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "changePasswordAt" TIMESTAMP WITH TIME ZONE, "image" character varying, "role" "public"."sys_users_role_enum" NOT NULL DEFAULT 'Client', "isVerified" boolean NOT NULL DEFAULT false, "phone" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_466c22a61fbc6141d7b064cbed4" UNIQUE ("username"), CONSTRAINT "PK_94e4c311695df641a042b1005d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_377c7f4fe0a3d7214878a09b6e" ON "sys_users"  ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_377c7f4fe0a3d7214878a09b6e"`);
        await queryRunner.query(`DROP TABLE "sys_users"`);
        await queryRunner.query(`DROP TYPE "public"."sys_users_role_enum"`);
    }

}
