import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePrices1762252285430 implements MigrationInterface {
    name = 'CreatePrices1762252285430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."prices_vehicletype_enum" AS ENUM('CAR', 'MOTORCYCLE')`);
        await queryRunner.query(`CREATE TABLE "prices" ("id" SERIAL NOT NULL, "building_id" integer NOT NULL, "vehicleType" "public"."prices_vehicletype_enum" NOT NULL, "rate_per_hour" numeric(4,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2e40b9e4e631a53cd514d82ccd2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6b2b327466f4c8fbe29b9cbe2f" ON "prices" ("building_id", "vehicleType") `);
        await queryRunner.query(`ALTER TABLE "prices" ADD CONSTRAINT "FK_65c07a30a30e21d06b55553dccb" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prices" DROP CONSTRAINT "FK_65c07a30a30e21d06b55553dccb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6b2b327466f4c8fbe29b9cbe2f"`);
        await queryRunner.query(`DROP TABLE "prices"`);
        await queryRunner.query(`DROP TYPE "public"."prices_vehicletype_enum"`);
    }

}
