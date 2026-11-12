import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MaintenanceTicket } from "./entities/maintenance-ticket.entity";
import { Equipment } from "../equipment/entities/equipment.entity";

import { MaintenanceTicketService } from "./maintenance-ticket.service";
import { MaintenanceTicketController } from "./maintenance-ticket.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceTicket, Equipment]),
  ],
  controllers: [MaintenanceTicketController],
  providers: [MaintenanceTicketService],
  exports: [],
})
export class MaintenanceTicketModule {}
