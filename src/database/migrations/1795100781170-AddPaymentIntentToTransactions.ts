import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentIntentToTransactions1795100781170 implements MigrationInterface {
    name = 'AddPaymentIntentToTransactions1795100781170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_transactions" ADD "paymentIntentId" character varying(255)`);
        await queryRunner.query(`CREATE INDEX "IDX_46b0c78ce850620e8dbf2f8ed0" ON "sys_transactions"  ("paymentIntentId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_46b0c78ce850620e8dbf2f8ed0"`);
        await queryRunner.query(`ALTER TABLE "sys_transactions" DROP COLUMN "paymentIntentId"`);
    }

}
