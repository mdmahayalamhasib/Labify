import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lab } from './lab.entity';

@Entity('lab_members')
@Unique(['labId', 'userId'])
export class LabMember {
  @PrimaryGeneratedColumn('uuid')
  labMemberId: string;

  @Column()
  labId: string;

  @Column()
  userId: string;

  @Column()
  memberRole: string; 

  @Column({ nullable: true })
  supervisorName: string;

  @ManyToOne(() => Lab, (lab) => lab.members, { onDelete: 'CASCADE' })
  lab: Lab;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}