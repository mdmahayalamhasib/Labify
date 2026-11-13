import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Lab } from './lab.entity';
import { CapabilityTag } from './capability-tag.entity';

@Entity('lab_capabilities')
@Unique(['labId', 'tagId', 'kind'])
export class LabCapability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  labId: string;

  @Column()
  tagId: string;

  @Column({
    type: 'enum',
    enum: ['OFFER', 'NEED'],
  })
  kind: 'OFFER' | 'NEED';

  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => Lab, (lab) => lab.capabilities, { onDelete: 'CASCADE' })
  lab: Lab;

  @ManyToOne(() => Tag, (tag) => tag.labCapabilities, { onDelete: 'CASCADE' })
  tag: CapabilityTag;
}