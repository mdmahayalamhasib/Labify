import { MigrationInterface, QueryRunner } from "typeorm";

export class EnableUuidOsspExtension1794400000000 implements MigrationInterface {
    name = 'EnableUuidOsspExtension1794400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Intentionally not dropping "uuid-ossp" extension during rollback because
        // it may pre-exist in the database or be shared by other database objects.
    }
}
