import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { Lab } from './lab.entity';
import { CapabilityTag } from './capability-tag.entity';

@Entity('lab_capabilities')
@Unique(['labId', 'tagId', 'kind'])
export class LabCapability {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  labId!: string;

  @Column({ type: 'uuid' })
  tagId!: string;

  @Column({
    type: 'enum',
    enum: ['OFFER', 'NEED'],
  })
  kind!: 'OFFER' | 'NEED';

  @Column({ nullable: true })
  note?: string;

  @ManyToOne(() => Lab, (lab) => lab.capabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lab_id' })
  lab!: Lab;

  @ManyToOne(() => CapabilityTag, (tag) => tag.labCapabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag!: CapabilityTag;
}
