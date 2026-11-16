import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MaintenanceTicket } from "./entities/maintenance-ticket.entity";
import { Equipment } from "../equipment/entities/equipment.entity";
import { Booking } from "../booking/entities/booking.entity";

import { MaintenanceTicketService } from "./maintenance-ticket.service";
import { MaintenanceTicketController } from "./maintenance-ticket.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceTicket, Equipment, Booking]),
  ],
  controllers: [MaintenanceTicketController],
  providers: [MaintenanceTicketService],
  exports: [],
})
export class MaintenanceTicketModule {}
