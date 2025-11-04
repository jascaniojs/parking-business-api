import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateParkingSpacesAndParkingSessions1762251586505 implements MigrationInterface {
    name = 'CreateParkingSpacesAndParkingSessions1762251586505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."parking_sessions_vehicletype_enum" AS ENUM('CAR', 'MOTORCYCLE')`);
        await queryRunner.query(`CREATE TABLE "parking_sessions" ("id" SERIAL NOT NULL, "parking_space_id" integer NOT NULL, "vehicleType" "public"."parking_sessions_vehicletype_enum" NOT NULL, "is_resident" boolean NOT NULL DEFAULT false, "rate_per_hour" numeric(10,2) NOT NULL, "check_in_at" TIMESTAMP NOT NULL, "check_out_at" TIMESTAMP, "calculated_charge" numeric(10,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3e965188d8b19a33232c3972b22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."parking_spaces_allowedvehicletype_enum" AS ENUM('CAR', 'MOTORCYCLE')`);
        await queryRunner.query(`CREATE TABLE "parking_spaces" ("id" SERIAL NOT NULL, "building_id" integer NOT NULL, "floor" integer NOT NULL, "number" integer NOT NULL, "allowedVehicleType" "public"."parking_spaces_allowedvehicletype_enum", "is_for_residents" boolean NOT NULL DEFAULT false, "current_session_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_4edef97af98d80270c53f859c1" UNIQUE ("current_session_id"), CONSTRAINT "PK_6b6bea8899e2761909aee98e065" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "parking_sessions" ADD CONSTRAINT "FK_1039b37ac8e8b7d1fcff5838b71" FOREIGN KEY ("parking_space_id") REFERENCES "parking_spaces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parking_spaces" ADD CONSTRAINT "FK_b51cc1e4abdd82c83a333597ae7" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parking_spaces" ADD CONSTRAINT "FK_4edef97af98d80270c53f859c1d" FOREIGN KEY ("current_session_id") REFERENCES "parking_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parking_spaces" DROP CONSTRAINT "FK_4edef97af98d80270c53f859c1d"`);
        await queryRunner.query(`ALTER TABLE "parking_spaces" DROP CONSTRAINT "FK_b51cc1e4abdd82c83a333597ae7"`);
        await queryRunner.query(`ALTER TABLE "parking_sessions" DROP CONSTRAINT "FK_1039b37ac8e8b7d1fcff5838b71"`);
        await queryRunner.query(`DROP TABLE "parking_spaces"`);
        await queryRunner.query(`DROP TYPE "public"."parking_spaces_allowedvehicletype_enum"`);
        await queryRunner.query(`DROP TABLE "parking_sessions"`);
        await queryRunner.query(`DROP TYPE "public"."parking_sessions_vehicletype_enum"`);
    }

}
