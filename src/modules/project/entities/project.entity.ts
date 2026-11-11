
import { ProjectStatus } from "@/common/enums/project-status.enum";
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from "typeorm";

@Entity({ name: "projects" })
export class Project {
  @PrimaryGeneratedColumn("uuid")
  projectId!: string;

  @Column()
  title!: string;

  @Column({
    type: "enum",
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status!: ProjectStatus;

  @Column({ type: "date", nullable: true })
  dueDate?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
