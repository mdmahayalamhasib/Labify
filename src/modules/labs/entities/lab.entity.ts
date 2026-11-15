import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { LabMember } from './lab-member.entity';
import { LabCapability } from './lab-capability.entity';

@Entity('labs')
export class Lab {
  @PrimaryGeneratedColumn('uuid')
  labId!: string;

  @Column({ unique: true })
  name!: string;

  @Column('text')
  description!: string;

  @Column()
  domain!: string;

  @Column()
  country!: string;

  @Column()
  city!: string;

  @Column({ default: 'public' })
  visibility!: string;

  @CreateDateColumn()
  verifiedAt!: Date;

  @OneToMany(() => LabMember, (member) => member.lab, { cascade: true })
  members!: LabMember[];

  @OneToMany(() => LabCapability, (cap) => cap.lab, { cascade: true })
  capabilities!: LabCapability[];
}
