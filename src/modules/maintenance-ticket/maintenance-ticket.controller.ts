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

import { CreateMaintenanceTicketDto } from "./dto/create-maintenance-ticket.dto";
import { UpdateMaintenanceTicketDto } from "./dto/update-maintenance-ticket.dto";
import { MaintenanceTicketService } from "./maintenance-ticket.service";
import { MaintenanceStatus } from "../../common/enums/maintenance-status.enum";

@Controller("maintenance-tickets")
export class MaintenanceTicketController {
  constructor(private readonly maintenanceTicketService: MaintenanceTicketService) {}
  @Post()
  createMaintenanceTicket(@Body() dto: CreateMaintenanceTicketDto) {
    return this.maintenanceTicketService.createMaintenanceTicket(dto);
  }

  @Get()
  getAllMaintenanceTickets(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("equipmentId") equipmentId?: string,
    @Query("status") status?: MaintenanceStatus,
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

    return this.maintenanceTicketService.getAllMaintenanceTickets(page, limit, equipmentId, status);

  }

  @Get(":id")
  getMaintenanceTicketById(@Param("id") id: string) {
    return this.maintenanceTicketService.getMaintenanceTicketById(id);
  }

  @Patch(":id")
  updateMaintenanceTicket(
    @Param("id") id: string,
    @Body() dto: UpdateMaintenanceTicketDto,
  ) {
    return this.maintenanceTicketService.updateMaintenanceTicket(id, dto);
  }

  @Delete(":id")
  deleteMaintenanceTicket(@Param("id") id: string) {
    return this.maintenanceTicketService.deleteMaintenanceTicket(id);
  }
}
