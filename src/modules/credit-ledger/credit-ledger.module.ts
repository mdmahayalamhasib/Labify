import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CreditLedger } from "./entities/credit-ledger.entity";
import { CreditLedgerService } from "./credit-ledger.service";
import { CreditLedgerController } from "./credit-ledger.controller";

@Module({
  imports: [TypeOrmModule.forFeature([CreditLedger])],
  controllers: [CreditLedgerController],
  providers: [CreditLedgerService],
  exports: [CreditLedgerService],
})
export class CreditLedgerModule {}