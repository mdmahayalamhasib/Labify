import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity({ name: "credit_ledger" })
export class CreditLedger {
  @PrimaryGeneratedColumn("uuid")
  entryId!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  amount!: number;

  @Column()
  reason!: string;

  @Column()
  refType!: string;

  @Column({ type: "uuid", nullable: true })
  refId?: string;

  @CreateDateColumn()
  createdAt!: Date;
  
}