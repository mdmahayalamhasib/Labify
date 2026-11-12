import { MigrationInterface, QueryRunner } from "typeorm";

// Author: Sazid Ahmed Ekram
export class CreateUsersTable1794505000000 implements MigrationInterface {
  name = "CreateUsersTable1794505000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('researcher', 'lab_owner', 'admin')`,
    );
    await queryRunner.query(`
      CREATE TABLE "users" (
        "user_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "full_name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'researcher',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_user_id" PRIMARY KEY ("user_id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
