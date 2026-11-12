import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  Query,
} from "@nestjs/common";

import { CreateEquipmentRuleDto } from "./dto/create-equipment-rule.dto";
import { UpdateEquipmentRuleDto } from "./dto/update-equipment-rule.dto";
import { EquipmentRuleService } from "./equipment-rule.service";

@Controller("equipment-rules")
export class EquipmentRuleController {
  constructor(private readonly equipmentRuleService: EquipmentRuleService) {}
  @Post()
  createEquipmentRule(@Body() dto: CreateEquipmentRuleDto) {
    return this.equipmentRuleService.createEquipmentRule(dto);
  }

  @Get()
  getAllEquipmentRules(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("equipmentId") equipmentId?: string,
  ) 
  {
    if (page < 1) {
      throw new BadRequestException("Page must be greater than 0");
    }

    if (limit < 1) {
      throw new BadRequestException("Limit must be greater than 0");
    }

    if (limit > 100) {
      limit = 100;
    }

    return this.equipmentRuleService.getAllEquipmentRules(page, limit, equipmentId);

  }

  @Get(":id")
  getEquipmentRuleById(@Param("id") id: string) {
    return this.equipmentRuleService.getEquipmentRuleById(id);
  }

  @Patch(":id")
  updateEquipmentRule(
    @Param("id") id: string,
    @Body() dto: UpdateEquipmentRuleDto,
  ) {
    return this.equipmentRuleService.updateEquipmentRule(id, dto);
  }

  @Delete(":id")
  deleteEquipmentRule(@Param("id") id: string) {
    return this.equipmentRuleService.deleteEquipmentRule(id);
  }
}
