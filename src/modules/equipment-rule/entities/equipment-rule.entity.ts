
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { Equipment } from "../../equipment/entities/equipment.entity";

@Entity({ name: "equipment_rules" })
export class EquipmentRule {
  @PrimaryGeneratedColumn("uuid")
  ruleId!: string;

  @Column({ type: "uuid" })
  equipmentId!: string;
  @ManyToOne(() => Equipment)
  @JoinColumn({ name: "equipment_id" })
  equipment!: Equipment;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "int", nullable: true })
  maxBookingMinutes?: number;

  @Column({ type: "int", nullable: true })
  advanceBookingDays?: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
