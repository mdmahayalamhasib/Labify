import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Equipment } from "./entities/equipment.entity";
import { Lab } from "../labs/entities/lab.entity";

import { EquipmentService } from "./equipment.service";
import { EquipmentController } from "./equipment.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipment, Lab]),
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [],
})
export class EquipmentModule {}
