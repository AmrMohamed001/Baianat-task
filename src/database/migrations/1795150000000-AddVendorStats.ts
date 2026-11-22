import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVendorStats1795150000000 implements MigrationInterface {
    name = 'AddVendorStats1795150000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_vendors" ADD "reviewsCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ADD "averageRating" numeric(2,1)`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ADD "followersCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`UPDATE "sys_vendors" v SET "reviewsCount" = r.cnt, "averageRating" = ROUND(r.avg, 1) FROM (SELECT "vendorId", COUNT(*) cnt, AVG(rating) avg FROM "sys_reviews" GROUP BY "vendorId") r WHERE r."vendorId" = v."id"`);
        await queryRunner.query(`UPDATE "sys_vendors" v SET "followersCount" = f.cnt FROM (SELECT "vendorId", COUNT(*) cnt FROM "sys_vendor_follows" GROUP BY "vendorId") f WHERE f."vendorId" = v."id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_vendors" DROP COLUMN "followersCount"`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" DROP COLUMN "averageRating"`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" DROP COLUMN "reviewsCount"`);
    }

}
