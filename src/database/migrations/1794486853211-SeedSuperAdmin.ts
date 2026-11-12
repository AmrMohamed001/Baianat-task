import { MigrationInterface, QueryRunner } from "typeorm";
import { hash } from "bcryptjs";

// Creates the first Super Admin. The password is never stored in the repo:
// set ADMIN_PASSWORD (and optionally ADMIN_EMAIL) in the environment that runs
// `migration:run`. Running it again is safe: an existing "admin" is left alone.
export class SeedSuperAdmin1794486853211 implements MigrationInterface {
    name = 'SeedSuperAdmin1794486853211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const password = process.env.ADMIN_PASSWORD;
        if (!password) {
            throw new Error('ADMIN_PASSWORD must be set to run SeedSuperAdmin');
        }
        const email = process.env.ADMIN_EMAIL;
        const fullname = process.env.ADMIN_FULLNAME ;

        await queryRunner.query(
            `INSERT INTO "sys_users" ("username", "fullname", "email", "password", "role", "isVerified")
             VALUES ($1, $2, $3, $4, 'Super Admin', true)
             ON CONFLICT ("username") DO NOTHING`,
            ['admin', fullname, email, await hash(password, 12)],
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "sys_users" WHERE "username" = 'admin' AND "role" = 'Super Admin'`,
        );
    }

}
