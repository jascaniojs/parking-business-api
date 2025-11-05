import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertParkingSessionIdToUuid1762292572645 implements MigrationInterface {
  name = 'ConvertParkingSessionIdToUuid1762292572645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parking_spaces" DROP CONSTRAINT "FK_4edef97af98d80270c53f859c1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" DROP CONSTRAINT "PK_3e965188d8b19a33232c3972b22"`,
    );
    await queryRunner.query(`ALTER TABLE "parking_sessions" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" ADD CONSTRAINT "PK_3e965188d8b19a33232c3972b22" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_spaces" DROP CONSTRAINT "REL_4edef97af98d80270c53f859c1"`,
    );
    await queryRunner.query(`ALTER TABLE "parking_spaces" DROP COLUMN "current_session_id"`);
    await queryRunner.query(`ALTER TABLE "parking_spaces" ADD "current_session_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "parking_spaces" ADD CONSTRAINT "UQ_4edef97af98d80270c53f859c1d" UNIQUE ("current_session_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_spaces" ADD CONSTRAINT "FK_4edef97af98d80270c53f859c1d" FOREIGN KEY ("current_session_id") REFERENCES "parking_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parking_spaces" DROP CONSTRAINT "FK_4edef97af98d80270c53f859c1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_spaces" DROP CONSTRAINT "UQ_4edef97af98d80270c53f859c1d"`,
    );
    await queryRunner.query(`ALTER TABLE "parking_spaces" DROP COLUMN "current_session_id"`);
    await queryRunner.query(`ALTER TABLE "parking_spaces" ADD "current_session_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "parking_spaces" ADD CONSTRAINT "REL_4edef97af98d80270c53f859c1" UNIQUE ("current_session_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" DROP CONSTRAINT "PK_3e965188d8b19a33232c3972b22"`,
    );
    await queryRunner.query(`ALTER TABLE "parking_sessions" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "parking_sessions" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "parking_sessions" ADD CONSTRAINT "PK_3e965188d8b19a33232c3972b22" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "parking_spaces" ADD CONSTRAINT "FK_4edef97af98d80270c53f859c1d" FOREIGN KEY ("current_session_id") REFERENCES "parking_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
