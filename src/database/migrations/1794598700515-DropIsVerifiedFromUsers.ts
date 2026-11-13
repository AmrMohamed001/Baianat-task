import { MigrationInterface, QueryRunner } from "typeorm";

// The vendor's state lives on sys_vendors.status. If email verification is
// needed later, add an `emailVerified` column under that name.
export class DropIsVerifiedFromUsers1794598700515 implements MigrationInterface {
    name = 'DropIsVerifiedFromUsers1794598700515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_users" DROP COLUMN "isVerified"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_users" ADD "isVerified" boolean NOT NULL DEFAULT false`);
    }

}
