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

import { CreateMaintenanceTicketDto } from "./dto/create-maintenance-ticket.dto";
import { UpdateMaintenanceTicketDto } from "./dto/update-maintenance-ticket.dto";
import { MaintenanceTicketService } from "./maintenance-ticket.service";
import { MaintenanceStatus } from "../../common/enums/maintenance-status.enum";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthUser } from "../../common/interfaces/auth-user.interface";

@Controller("maintenance-tickets")
export class MaintenanceTicketController {
  constructor(private readonly maintenanceTicketService: MaintenanceTicketService) {}
  @Post()
  createMaintenanceTicket(
    @Body() dto: CreateMaintenanceTicketDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.maintenanceTicketService.createMaintenanceTicket(dto, user);
  }

  @Get()
  getAllMaintenanceTickets(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("equipmentId", new ParseUUIDPipe({ optional: true })) equipmentId?: string,
    @Query("status", new ParseEnumPipe(MaintenanceStatus, { optional: true })) status?: MaintenanceStatus,
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
  getMaintenanceTicketById(@Param("id", ParseUUIDPipe) id: string) {
    return this.maintenanceTicketService.getMaintenanceTicketById(id);
  }

  @Patch(":id")
  updateMaintenanceTicket(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceTicketDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.maintenanceTicketService.updateMaintenanceTicket(id, dto, user);
  }

  @Delete(":id")
  deleteMaintenanceTicket(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.maintenanceTicketService.deleteMaintenanceTicket(id, user);
  }
}
