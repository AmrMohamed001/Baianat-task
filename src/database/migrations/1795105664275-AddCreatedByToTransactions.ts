import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedByToTransactions1795105664275 implements MigrationInterface {
    name = 'AddCreatedByToTransactions1795105664275'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_transactions" ADD "createdBy" integer`);
        await queryRunner.query(`ALTER TABLE "sys_transactions" ADD CONSTRAINT "FK_6dee377061c1e46d6d3c48b9ada" FOREIGN KEY ("createdBy") REFERENCES "sys_users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_transactions" DROP CONSTRAINT "FK_6dee377061c1e46d6d3c48b9ada"`);
        await queryRunner.query(`ALTER TABLE "sys_transactions" DROP COLUMN "createdBy"`);
    }

}
