import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Project } from "../../project/entities/project.entity";
import { MilestoneStatus } from "@/common/enums/milestone-status.enum";

@Entity({ name: "milestones" })
export class Milestone {
  @PrimaryGeneratedColumn("uuid")
  milestoneId!: string;

  @Column()
  projectId!: string;

  @Column()
  title!: string;

  @Column({ type: "date", nullable: true })
  dueDate?: Date;

  @Column({
    type: "enum",
    enum: MilestoneStatus,
    default: MilestoneStatus.PENDING,
  })
  status!: MilestoneStatus;

  @ManyToOne(() => Project)
  @JoinColumn({ name: "project_id" })
  project!: Project;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}