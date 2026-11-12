import { Controller } from "@nestjs/common";
import { CreditLedgerService } from "./credit-ledger.service";

@Controller("credits")
export class CreditLedgerController {
  constructor(
    private readonly creditLedgerService: CreditLedgerService,
  ) {}
}