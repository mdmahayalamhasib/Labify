import { Controller, Get } from "@nestjs/common";
import { CreditLedgerService } from "./credit-ledger.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthUser } from "../../common/interfaces/auth-user.interface";

@Controller("credits")
export class CreditLedgerController {
  constructor(
    private readonly creditLedgerService: CreditLedgerService,
  ) {}

  @Get("me")
  async getMyCredits(@CurrentUser() user: AuthUser) {
    const [balance, transactions] = await Promise.all([
      this.creditLedgerService.getMyBalance(user.id),
      this.creditLedgerService.getMyEntries(user.id),
    ]);

    return {
      balance,
      transactions,
    };
  }
}
