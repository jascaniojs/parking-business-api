import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBuildings1762249046776 implements MigrationInterface {
    name = 'CreateBuildings1762249046776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "buildings" ("id" SERIAL NOT NULL, "name" character varying(140) NOT NULL, "address" character varying(140) NOT NULL, "total_floors" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bc65c1acce268c383e41a69003a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "buildings"`);
    }

}
