
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { MaintenanceStatus } from "../../../common/enums/maintenance-status.enum";
import { MaintenancePriority } from "../../../common/enums/maintenance-priority.enum";
import { Equipment } from "../../equipment/entities/equipment.entity";

@Entity({ name: "maintenance_tickets" })
export class MaintenanceTicket {
  @PrimaryGeneratedColumn("uuid")
  ticketId!: string;

  @Column({ type: "uuid" })
  equipmentId!: string;
  @ManyToOne(() => Equipment)
  @JoinColumn({ name: "equipment_id" })
  equipment!: Equipment;

  @Column({ type: "uuid" })
  reportedById!: string;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: MaintenanceStatus,
    default: MaintenanceStatus.OPEN,
  })
  status!: MaintenanceStatus;

  @Column({
    type: "enum",
    enum: MaintenancePriority,
    default: MaintenancePriority.MEDIUM,
  })
  priority!: MaintenancePriority;

  @Column({ type: "timestamp", nullable: true })
  downtimeStart?: Date | null;

  @Column({ type: "timestamp", nullable: true })
  downtimeEnd?: Date | null;

  @Column({ type: "timestamp", nullable: true })
  resolvedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
