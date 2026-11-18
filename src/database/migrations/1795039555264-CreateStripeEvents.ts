import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStripeEvents1795039555264 implements MigrationInterface {
    name = 'CreateStripeEvents1795039555264'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sys_stripe_events" ("id" character varying(255) NOT NULL, "type" character varying(100) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4d71329f0de0585fee3660ea9d0" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "sys_stripe_events"`);
    }

}
