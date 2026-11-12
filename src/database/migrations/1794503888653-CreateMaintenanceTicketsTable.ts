import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMaintenanceTicketsTable1794503888653 implements MigrationInterface {
    name = 'CreateMaintenanceTicketsTable1794503888653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."maintenance_tickets_status_enum" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')`);
        await queryRunner.query(`CREATE TYPE "public"."maintenance_tickets_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`);
        await queryRunner.query(`CREATE TABLE "maintenance_tickets" ("ticket_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "equipment_id" uuid NOT NULL, "reported_by_id" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "status" "public"."maintenance_tickets_status_enum" NOT NULL DEFAULT 'OPEN', "priority" "public"."maintenance_tickets_priority_enum" NOT NULL DEFAULT 'MEDIUM', "resolved_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d7c3b1a5e8f2d4c6a0b8e2f4d6c8a0e" PRIMARY KEY ("ticket_id"))`);
        await queryRunner.query(`ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "FK_b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("equipment_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenance_tickets" DROP CONSTRAINT "FK_b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7"`);
        await queryRunner.query(`DROP TABLE "maintenance_tickets"`);
        await queryRunner.query(`DROP TYPE "public"."maintenance_tickets_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."maintenance_tickets_status_enum"`);
    }

}
