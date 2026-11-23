import { MigrationInterface, QueryRunner } from "typeorm";

export class DropIsVerifiedFromUsers1794598700515 implements MigrationInterface {
    name = 'DropIsVerifiedFromUsers1794598700515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_users" DROP COLUMN "isVerified"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_users" ADD "isVerified" boolean NOT NULL DEFAULT false`);
    }

}
