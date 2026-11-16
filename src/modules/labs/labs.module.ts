import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';
import { Lab } from './entities/lab.entity';
import { LabMember } from './entities/lab-member.entity';
import { CapabilityTag } from './entities/capability-tag.entity';
import { LabCapability } from './entities/lab-capability.entity';
import { User } from '../users/entities/user.entity';
import { Equipment } from '../equipment/entities/equipment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lab,
      LabMember,
      CapabilityTag,
      LabCapability,
      User, 
      Equipment,
    ]),
  ],
  controllers: [LabsController],
  providers: [LabsService],
  exports: [LabsService],
})
export class LabsModule {}
