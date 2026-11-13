import { MigrationInterface, QueryRunner } from "typeorm";

// One wallet per user (the admin needs one too). Balance is integer cents.
export class CreateWallets1794598700517 implements MigrationInterface {
    name = 'CreateWallets1794598700517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sys_wallets" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "balance" bigint NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_5f2084b957e70a25d8db915ca4" UNIQUE ("userId"), CONSTRAINT "PK_3352e506ff8e59849c892d02905" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sys_wallets" ADD CONSTRAINT "FK_5f2084b957e70a25d8db915ca45" FOREIGN KEY ("userId") REFERENCES "sys_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_wallets" DROP CONSTRAINT "FK_5f2084b957e70a25d8db915ca45"`);
        await queryRunner.query(`DROP TABLE "sys_wallets"`);
    }

}
