import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLabsTables1794506100000 implements MigrationInterface {
  name = "CreateLabsTables1794506100000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."lab_capabilities_kind_enum" AS ENUM('OFFER', 'NEED')`,
    );
    await queryRunner.query(`
      CREATE TABLE "labs" (
        "lab_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text NOT NULL,
        "domain" character varying NOT NULL,
        "country" character varying NOT NULL,
        "city" character varying NOT NULL,
        "visibility" character varying NOT NULL DEFAULT 'public',
        "verified_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_labs_name" UNIQUE ("name"),
        CONSTRAINT "PK_labs_lab_id" PRIMARY KEY ("lab_id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "capability_tags" (
        "tag_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "category" character varying NOT NULL,
        CONSTRAINT "UQ_capability_tags_name" UNIQUE ("name"),
        CONSTRAINT "PK_capability_tags_tag_id" PRIMARY KEY ("tag_id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "lab_members" (
        "lab_member_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "lab_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "member_role" character varying NOT NULL,
        "supervisor_name" character varying,
        CONSTRAINT "UQ_lab_members_lab_id_user_id" UNIQUE ("lab_id", "user_id"),
        CONSTRAINT "PK_lab_members_lab_member_id" PRIMARY KEY ("lab_member_id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "lab_capabilities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "lab_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        "kind" "public"."lab_capabilities_kind_enum" NOT NULL,
        "note" character varying,
        CONSTRAINT "UQ_lab_capabilities_lab_id_tag_id_kind" UNIQUE ("lab_id", "tag_id", "kind"),
        CONSTRAINT "PK_lab_capabilities_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "lab_members" ADD CONSTRAINT "FK_lab_members_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("lab_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lab_members" ADD CONSTRAINT "FK_lab_members_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lab_capabilities" ADD CONSTRAINT "FK_lab_capabilities_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("lab_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lab_capabilities" ADD CONSTRAINT "FK_lab_capabilities_tag_id" FOREIGN KEY ("tag_id") REFERENCES "capability_tags"("tag_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lab_capabilities" DROP CONSTRAINT "FK_lab_capabilities_tag_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lab_capabilities" DROP CONSTRAINT "FK_lab_capabilities_lab_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lab_members" DROP CONSTRAINT "FK_lab_members_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lab_members" DROP CONSTRAINT "FK_lab_members_lab_id"`,
    );
    await queryRunner.query(`DROP TABLE "lab_capabilities"`);
    await queryRunner.query(`DROP TABLE "lab_members"`);
    await queryRunner.query(`DROP TABLE "capability_tags"`);
    await queryRunner.query(`DROP TABLE "labs"`);
    await queryRunner.query(`DROP TYPE "public"."lab_capabilities_kind_enum"`);
  }
}
