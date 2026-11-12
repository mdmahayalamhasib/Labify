import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EquipmentRule } from "./entities/equipment-rule.entity";
import { Equipment } from "../equipment/entities/equipment.entity";

import { EquipmentRuleService } from "./equipment-rule.service";
import { EquipmentRuleController } from "./equipment-rule.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([EquipmentRule, Equipment]),
  ],
  controllers: [EquipmentRuleController],
  providers: [EquipmentRuleService],
  exports: [],
})
export class EquipmentRuleModule {}
