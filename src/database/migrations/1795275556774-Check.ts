import { MigrationInterface, QueryRunner } from "typeorm";

export class Check1795275556774 implements MigrationInterface {
    name = 'Check1795275556774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_wallets" DROP CONSTRAINT "CHK_wallet_balance_not_negative"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_wallets" ADD CONSTRAINT "CHK_wallet_balance_not_negative" CHECK ((balance >= 0))`);
    }

}
