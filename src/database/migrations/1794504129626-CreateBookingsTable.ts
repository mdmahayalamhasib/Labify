import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBookingsTable1794504129626 implements MigrationInterface {
    name = 'CreateBookingsTable1794504129626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "bookings" ("booking_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "equipment_id" uuid NOT NULL, "user_id" uuid NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "purpose" text, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'PENDING', "reviewed_by_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d" PRIMARY KEY ("booking_id"))`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("equipment_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
    }

}
