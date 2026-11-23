import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProducts1794807181357 implements MigrationInterface {
    name = 'CreateProducts1794807181357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["Baianat-test-DB","public","sys_products","GENERATED_COLUMN","searchVectorAr","setweight(to_tsvector('simple', coalesce(\"nameAr\", '')), 'A') || setweight(to_tsvector('simple', coalesce(\"descriptionAr\", '')), 'B')"]);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["Baianat-test-DB","public","sys_products","GENERATED_COLUMN","searchVectorEn","setweight(to_tsvector('english', coalesce(\"nameEn\", '')), 'A') || setweight(to_tsvector('english', coalesce(\"descriptionEn\", '')), 'B')"]);
        await queryRunner.query(`CREATE TABLE "sys_products" ("id" SERIAL NOT NULL, "vendorId" integer NOT NULL, "categoryId" integer, "nameAr" character varying(120) NOT NULL, "nameEn" character varying(120) NOT NULL, "descriptionAr" character varying(2000), "descriptionEn" character varying(2000), "price" bigint NOT NULL, "stock" integer NOT NULL DEFAULT '0', "searchVectorAr" tsvector GENERATED ALWAYS AS (setweight(to_tsvector('simple', coalesce("nameAr", '')), 'A') || setweight(to_tsvector('simple', coalesce("descriptionAr", '')), 'B')) STORED NOT NULL, "searchVectorEn" tsvector GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce("nameEn", '')), 'A') || setweight(to_tsvector('english', coalesce("descriptionEn", '')), 'B')) STORED NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c99e2b5eb37d49fe253a172c0f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_products_search_vector_ar" ON "sys_products" USING GIN ("searchVectorAr")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_search_vector_en" ON "sys_products" USING GIN ("searchVectorEn")`);
        await queryRunner.query(`CREATE INDEX "IDX_1e94124767a59b5a48e4f2abd1" ON "sys_products"  ("categoryId") `);
        await queryRunner.query(`CREATE INDEX "IDX_35d93675ec6373194a05353b1d" ON "sys_products"  ("vendorId") `);
        await queryRunner.query(`ALTER TABLE "sys_products" ADD CONSTRAINT "FK_35d93675ec6373194a05353b1d1" FOREIGN KEY ("vendorId") REFERENCES "sys_vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sys_products" ADD CONSTRAINT "FK_1e94124767a59b5a48e4f2abd1c" FOREIGN KEY ("categoryId") REFERENCES "sys_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_products" DROP CONSTRAINT "FK_1e94124767a59b5a48e4f2abd1c"`);
        await queryRunner.query(`ALTER TABLE "sys_products" DROP CONSTRAINT "FK_35d93675ec6373194a05353b1d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_35d93675ec6373194a05353b1d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1e94124767a59b5a48e4f2abd1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_products_search_vector_en"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_products_search_vector_ar"`);
        await queryRunner.query(`DROP TABLE "sys_products"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","searchVectorEn","Baianat-test-DB","public","sys_products"]);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","searchVectorAr","Baianat-test-DB","public","sys_products"]);
    }

}
