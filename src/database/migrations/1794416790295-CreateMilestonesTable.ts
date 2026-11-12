import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMilestonesTable1794416790295 implements MigrationInterface {
    name = 'CreateMilestonesTable1794416790295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."milestones_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "milestones" ("milestone_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "title" character varying NOT NULL, "due_date" date, "status" "public"."milestones_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f1e1f90ada344ec4c4dd1ad0a70" PRIMARY KEY ("milestone_id"))`);
        await queryRunner.query(`ALTER TABLE "milestones" ADD CONSTRAINT "FK_2204463ea4c5c1872e1fb2b8ffb" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "milestones" DROP CONSTRAINT "FK_2204463ea4c5c1872e1fb2b8ffb"`);
        await queryRunner.query(`DROP TABLE "milestones"`);
        await queryRunner.query(`DROP TYPE "public"."milestones_status_enum"`);
    }

}
