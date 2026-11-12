
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { TaskStatus } from "../../../common/enums/task-status.enum";
import { Project } from "../../project/entities/project.entity";
import { Milestone } from "../../milestone/entities/milestone.entity";
@Entity({ name: "tasks" })
export class Task {
  @PrimaryGeneratedColumn("uuid")
  taskId!: string;

  @Column({ type: "uuid" })
  projectId!: string;
  @ManyToOne(() => Project)
  @JoinColumn({ name: "project_id" })
  project!: Project;

  @Column({ type: "uuid" })
  milestoneId!: string;
  @ManyToOne(() => Milestone)
  @JoinColumn({ name: "milestone_id" })
  milestone!: Milestone;
  @Column({ type: "uuid" })
  assigneeId!: string;

  @Column()
  title!: string;

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @Column({ type: "date", nullable: true })
  dueDate?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
