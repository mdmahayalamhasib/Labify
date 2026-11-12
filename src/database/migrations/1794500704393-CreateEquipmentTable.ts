import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEquipmentTable1794500704393 implements MigrationInterface {
    name = 'CreateEquipmentTable1794500704393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."equipment_status_enum" AS ENUM('AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE')`);
        await queryRunner.query(`CREATE TABLE "equipment" ("equipment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lab_id" uuid NOT NULL, "name" character varying NOT NULL, "description" text, "equipment_type" character varying NOT NULL, "location" character varying, "requires_approval" boolean NOT NULL DEFAULT true, "status" "public"."equipment_status_enum" NOT NULL DEFAULT 'AVAILABLE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3b3ab02f8d1e7a2f4a0c8b0d2e4f6a8c" PRIMARY KEY ("equipment_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "equipment"`);
        await queryRunner.query(`DROP TYPE "public"."equipment_status_enum"`);
    }

}
