import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDowntimeToMaintenanceTickets1794507000000 implements MigrationInterface {
    name = 'AddDowntimeToMaintenanceTickets1794507000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenance_tickets" ADD "downtime_start" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "maintenance_tickets" ADD "downtime_end" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenance_tickets" DROP COLUMN "downtime_end"`);
        await queryRunner.query(`ALTER TABLE "maintenance_tickets" DROP COLUMN "downtime_start"`);
    }

}
