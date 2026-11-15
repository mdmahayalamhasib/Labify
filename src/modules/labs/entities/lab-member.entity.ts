import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lab } from './lab.entity';

@Entity('lab_members')
@Unique(['labId', 'userId'])
export class LabMember {
  @PrimaryGeneratedColumn('uuid')
  labMemberId!: string;

  @Column({ type: 'uuid' })
  labId!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column()
  memberRole!: string; 

  @Column({ nullable: true })
  supervisorName?: string;

  @ManyToOne(() => Lab, (lab) => lab.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lab_id' })
  lab!: Lab;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
