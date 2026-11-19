import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransactions1795099329733 implements MigrationInterface {
    name = 'CreateTransactions1795099329733'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sys_transactions_type_enum" AS ENUM('Sale', 'Payout', 'Refund')`);
        await queryRunner.query(`CREATE TABLE "sys_transactions" ("id" SERIAL NOT NULL, "walletId" integer NOT NULL, "type" "public"."sys_transactions_type_enum" NOT NULL, "amount" bigint NOT NULL, "orderId" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_590d95a0b271c40a383893d03d8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_24b219e239880e1b83009d442a" ON "sys_transactions"  ("walletId") `);
        await queryRunner.query(`ALTER TABLE "sys_wallets" ADD CONSTRAINT "CHK_wallet_balance_not_negative" CHECK ("balance" >= 0)`);
        await queryRunner.query(`ALTER TABLE "sys_transactions" ADD CONSTRAINT "FK_24b219e239880e1b83009d442a9" FOREIGN KEY ("walletId") REFERENCES "sys_wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_transactions" ADD CONSTRAINT "FK_98c5c64f8dfa1e86e759db40e00" FOREIGN KEY ("orderId") REFERENCES "sys_orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`INSERT INTO "sys_wallets" ("userId") SELECT "id" FROM "sys_users" WHERE "role" = 'Super Admin' AND "id" NOT IN (SELECT "userId" FROM "sys_wallets")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_transactions" DROP CONSTRAINT "FK_98c5c64f8dfa1e86e759db40e00"`);
        await queryRunner.query(`ALTER TABLE "sys_transactions" DROP CONSTRAINT "FK_24b219e239880e1b83009d442a9"`);
        await queryRunner.query(`ALTER TABLE "sys_wallets" DROP CONSTRAINT "CHK_wallet_balance_not_negative"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_24b219e239880e1b83009d442a"`);
        await queryRunner.query(`DROP TABLE "sys_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."sys_transactions_type_enum"`);
    }

}
