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

import { CreateEquipmentDto } from "./dto/create-equipment.dto";
import { UpdateEquipmentDto } from "./dto/update-equipment.dto";
import { EquipmentService } from "./equipment.service";
import { EquipmentStatus } from "../../common/enums/equipment-status.enum";

@Controller("equipment")
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}
  @Post()
  createEquipment(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.createEquipment(dto);
  }

  @Get()
  getAllEquipment(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("labId") labId?: string,
    @Query("status") status?: EquipmentStatus,
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

    return this.equipmentService.getAllEquipment(page, limit, labId, status);

  }

  @Get(":id")
  getEquipmentById(@Param("id") id: string) {
    return this.equipmentService.getEquipmentById(id);
  }

  @Patch(":id")
  updateEquipment(
    @Param("id") id: string,
    @Body() dto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.updateEquipment(id, dto);
  }

  @Delete(":id")
  deleteEquipment(@Param("id") id: string) {
    return this.equipmentService.deleteEquipment(id);
  }
}
