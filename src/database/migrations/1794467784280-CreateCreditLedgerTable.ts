import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCreditLedgerTable1794467784280 implements MigrationInterface {
    name = 'CreateCreditLedgerTable1794467784280'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "credit_ledger" ("entry_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "reason" character varying NOT NULL, "ref_type" character varying NOT NULL, "ref_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f16ff080bd4d67afb2f5413408d" PRIMARY KEY ("entry_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "credit_ledger"`);
    }

}
