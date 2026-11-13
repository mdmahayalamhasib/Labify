import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  ParseUUIDPipe,
  ParseEnumPipe,
  DefaultValuePipe,
  BadRequestException,
  Query,
} from "@nestjs/common";

import { CreateEquipmentDto } from "./dto/create-equipment.dto";
import { UpdateEquipmentDto } from "./dto/update-equipment.dto";
import { EquipmentService } from "./equipment.service";
import { EquipmentStatus } from "../../common/enums/equipment-status.enum";
import { AccountRole } from "../../common/enums/account-role.enum";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("equipment")
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}
  @Post()
  @Roles(AccountRole.LAB_OWNER, AccountRole.ADMIN)
  createEquipment(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.createEquipment(dto);
  }

  @Get()
  getAllEquipment(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("labId", new ParseUUIDPipe({ optional: true })) labId?: string,
    @Query("status", new ParseEnumPipe(EquipmentStatus, { optional: true })) status?: EquipmentStatus,
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
  getEquipmentById(@Param("id", ParseUUIDPipe) id: string) {
    return this.equipmentService.getEquipmentById(id);
  }

  @Patch(":id")
  @Roles(AccountRole.LAB_OWNER, AccountRole.ADMIN)
  updateEquipment(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.updateEquipment(id, dto);
  }

  @Delete(":id")
  @Roles(AccountRole.LAB_OWNER, AccountRole.ADMIN)
  deleteEquipment(@Param("id", ParseUUIDPipe) id: string) {
    return this.equipmentService.deleteEquipment(id);
  }
}
