import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LabCapability } from './lab-capability.entity';

@Entity('capability_tags')
export class CapabilityTag {
  @PrimaryGeneratedColumn('uuid')
  tagId: string;

  @Column({ unique: true })
  name: string;

  @Column()
  category: string; // e.g., 'instrument', 'method', 'dataset'

  @OneToMany(() => LabCapability, (labCap) => labCap.tag, { cascade: true })
  labCapabilities: LabCapability[];
}