// Author: Sazid Ahmed Ekram
import { AccountRole } from "@/common/enums/account-role.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  userId!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  // Keep the password hash private; controllers return only safe user fields.
  @Column({ select: false })
  passwordHash!: string;

  @Column({ type: "enum", enum: AccountRole, default: AccountRole.RESEARCHER })
  role!: AccountRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
