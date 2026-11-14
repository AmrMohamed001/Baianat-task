import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameApprovedToReviewedOnVendors1794700000000 implements MigrationInterface {
    name = 'RenameApprovedToReviewedOnVendors1794700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_vendors" RENAME COLUMN "approvedBy" TO "reviewedBy"`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" RENAME COLUMN "approvedAt" TO "reviewedAt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_vendors" RENAME COLUMN "reviewedAt" TO "approvedAt"`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" RENAME COLUMN "reviewedBy" TO "approvedBy"`);
    }

}
