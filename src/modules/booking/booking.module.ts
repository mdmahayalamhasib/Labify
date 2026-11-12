import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Booking } from "./entities/booking.entity";
import { Equipment } from "../equipment/entities/equipment.entity";

import { BookingService } from "./booking.service";
import { BookingController } from "./booking.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Equipment]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [],
})
export class BookingModule {}
