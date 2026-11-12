
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { BookingStatus } from "../../../common/enums/booking-status.enum";
import { Equipment } from "../../equipment/entities/equipment.entity";

@Entity({ name: "bookings" })
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  bookingId!: string;

  @Column({ type: "uuid" })
  equipmentId!: string;
  @ManyToOne(() => Equipment)
  @JoinColumn({ name: "equipment_id" })
  equipment!: Equipment;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "timestamp" })
  startTime!: Date;

  @Column({ type: "timestamp" })
  endTime!: Date;

  @Column({ type: "text", nullable: true })
  purpose?: string;

  @Column({
    type: "enum",
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status!: BookingStatus;

  @Column({ type: "uuid", nullable: true })
  reviewedById?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
