
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { EquipmentStatus } from "../../../common/enums/equipment-status.enum";
import { Lab } from "../../labs/entities/lab.entity";

@Entity({ name: "equipment" })
export class Equipment {
  @PrimaryGeneratedColumn("uuid")
  equipmentId!: string;

  @Column({ type: "uuid" })
  labId!: string;

  @ManyToOne(() => Lab, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "lab_id" })
  lab?: Lab;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column()
  equipmentType!: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ default: true })
  requiresApproval!: boolean;

  @Column({
    type: "enum",
    enum: EquipmentStatus,
    default: EquipmentStatus.AVAILABLE,
  })
  status!: EquipmentStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
