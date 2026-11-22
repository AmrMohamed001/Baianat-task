import { MigrationInterface, QueryRunner } from "typeorm";

// Replaced by sys_users.photoKey (profile photo uploads).
export class DropImageFromUsers1795360000000 implements MigrationInterface {
    name = 'DropImageFromUsers1795360000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_users" DROP COLUMN "image"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_users" ADD "image" character varying`);
    }

}
