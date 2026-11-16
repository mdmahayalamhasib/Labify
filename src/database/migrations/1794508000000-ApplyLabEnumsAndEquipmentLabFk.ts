import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplyLabEnumsAndEquipmentLabFk1794508000000 implements MigrationInterface {
  name = "ApplyLabEnumsAndEquipmentLabFk1794508000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "labs" SET "visibility" = LOWER(TRIM("visibility"))`,
    );
    await queryRunner.query(
      `UPDATE "lab_members" SET "member_role" = UPPER(TRIM("member_role"))`,
    );

    const invalidVisibility: { visibility: string }[] = await queryRunner.query(
      `SELECT DISTINCT "visibility" FROM "labs" WHERE "visibility" NOT IN ('public', 'private')`,
    );
    if (invalidVisibility.length) {
      throw new Error(
        `labs.visibility has unsupported values: ${invalidVisibility.map((r) => r.visibility).join(", ")}`,
      );
    }
    const invalidRoles: { member_role: string }[] = await queryRunner.query(
      `SELECT DISTINCT "member_role" FROM "lab_members" WHERE "member_role" NOT IN ('OWNER', 'VISITOR', 'RESEARCHER')`,
    );
    if (invalidRoles.length) {
      throw new Error(
        `lab_members.member_role has unsupported values: ${invalidRoles.map((r) => r.member_role).join(", ")}`,
      );
    }
    const orphanedEquipment: { count: string }[] = await queryRunner.query(
      `SELECT COUNT(*) AS "count" FROM "equipment" e WHERE NOT EXISTS (SELECT 1 FROM "labs" l WHERE l."lab_id" = e."lab_id")`,
    );
    if (Number(orphanedEquipment[0].count) > 0) {
      throw new Error(
        `${orphanedEquipment[0].count} equipment row(s) reference a lab that does not exist; fix or remove them before running this migration`,
      );
    }

    await queryRunner.query(
      `CREATE TYPE "public"."labs_visibility_enum" AS ENUM('public', 'private')`,
    );
    await queryRunner.query(
      `ALTER TABLE "labs" ALTER COLUMN "visibility" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "labs" ALTER COLUMN "visibility" TYPE "public"."labs_visibility_enum" USING "visibility"::"public"."labs_visibility_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "labs" ALTER COLUMN "visibility" SET DEFAULT 'public'`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."lab_members_member_role_enum" AS ENUM('OWNER', 'VISITOR', 'RESEARCHER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "lab_members" ALTER COLUMN "member_role" TYPE "public"."lab_members_member_role_enum" USING "member_role"::"public"."lab_members_member_role_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "equipment" ADD CONSTRAINT "FK_equipment_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("lab_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "equipment" DROP CONSTRAINT "FK_equipment_lab_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "lab_members" ALTER COLUMN "member_role" TYPE character varying USING "member_role"::text`,
    );
    await queryRunner.query(`DROP TYPE "public"."lab_members_member_role_enum"`);

    await queryRunner.query(
      `ALTER TABLE "labs" ALTER COLUMN "visibility" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "labs" ALTER COLUMN "visibility" TYPE character varying USING "visibility"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "labs" ALTER COLUMN "visibility" SET DEFAULT 'public'`,
    );
    await queryRunner.query(`DROP TYPE "public"."labs_visibility_enum"`);
  }
}
