import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreditLedger } from "./entities/credit-ledger.entity";
import { CreateCreditEntryDto } from "./dto/create-credit-entry.dto";

@Injectable()
export class CreditLedgerService {
  constructor(
    @InjectRepository(CreditLedger)
    private readonly creditLedgerRepository: Repository<CreditLedger>,
  ) {}

  async createEntry(userId: string, dto: CreateCreditEntryDto) {
    const entry = this.creditLedgerRepository.create({
      ...dto,
      userId,
    });
    return await this.creditLedgerRepository.save(entry);
  }

  async getMyEntries(userId: string) {
    return await this.creditLedgerRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async getMyBalance(userId: string) {
    const entries = await this.getMyEntries(userId);

    return entries.reduce(
      (total, entry) => total + Number(entry.amount),
      0,
    );
  }
}