import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviewRatingCheck1795140000000 implements MigrationInterface {
    name = 'AddReviewRatingCheck1795140000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_reviews" ADD CONSTRAINT "CHK_review_rating_range" CHECK ("rating" BETWEEN 1 AND 5)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_reviews" DROP CONSTRAINT "CHK_review_rating_range"`);
    }

}
