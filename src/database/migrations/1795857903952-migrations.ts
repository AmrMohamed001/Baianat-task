import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1795857903952 implements MigrationInterface {
    name = 'Migrations1795857903952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_vendors" ALTER COLUMN "averageRating" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ALTER COLUMN "averageRating" SET DEFAULT '4.5'`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_wallets" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "sys_wallets" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_wallets" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "sys_wallets" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_users" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "sys_users" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "sys_users" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_carts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "sys_carts" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_carts" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "sys_carts" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_carts" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "sys_carts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_carts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "sys_carts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "sys_users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_users" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "sys_users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_wallets" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "sys_wallets" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_wallets" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "sys_wallets" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ALTER COLUMN "averageRating" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sys_vendors" ALTER COLUMN "averageRating" DROP NOT NULL`);
    }

}
