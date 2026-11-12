import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEquipmentRulesTable1794502824300 implements MigrationInterface {
    name = 'CreateEquipmentRulesTable1794502824300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "equipment_rules" ("rule_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "equipment_id" uuid NOT NULL, "name" character varying NOT NULL, "description" text, "max_booking_minutes" integer, "advance_booking_days" integer, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8f4e6a2c1d3b5e7f9a0c2d4e6f8a0b2c" PRIMARY KEY ("rule_id"))`);
        await queryRunner.query(`ALTER TABLE "equipment_rules" ADD CONSTRAINT "FK_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("equipment_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "equipment_rules" DROP CONSTRAINT "FK_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"`);
        await queryRunner.query(`DROP TABLE "equipment_rules"`);
    }

}
