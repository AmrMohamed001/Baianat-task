import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShippingAddressToCheckouts1795010070877 implements MigrationInterface {
    name = 'AddShippingAddressToCheckouts1795010070877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_checkouts" ADD "shippingAddress" character varying(500) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_checkouts" DROP COLUMN "shippingAddress"`);
    }

}
