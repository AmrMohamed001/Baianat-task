import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameOrderPaidToProcessing1794930000000 implements MigrationInterface {
    name = 'RenameOrderPaidToProcessing1794930000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."sys_orders_status_enum" RENAME VALUE 'Paid' TO 'Processing'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."sys_orders_status_enum" RENAME VALUE 'Processing' TO 'Paid'`);
    }

}
