import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasksTable1794431843659 implements MigrationInterface {
    name = 'CreateTasksTable1794431843659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED')`);
        await queryRunner.query(`CREATE TABLE "tasks" ("task_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "milestone_id" uuid NOT NULL, "assignee_id" uuid NOT NULL, "title" character varying NOT NULL, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'TODO', "due_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3feca00d238e5cf50185fab8d46" PRIMARY KEY ("task_id"))`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_9eecdb5b1ed8c7c2a1b392c28d4" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_39abeb50240a7312a00786c9b24" FOREIGN KEY ("milestone_id") REFERENCES "milestones"("milestone_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_39abeb50240a7312a00786c9b24"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9eecdb5b1ed8c7c2a1b392c28d4"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    }

}
