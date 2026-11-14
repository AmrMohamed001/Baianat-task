import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRejectionReasonToVendors1794617528317 implements MigrationInterface {
    name = 'AddRejectionReasonToVendors1794617528317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_vendors" ADD "rejectionReason" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_vendors" DROP COLUMN "rejectionReason"`);
    }

}
