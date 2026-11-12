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

import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { BookingService } from "./booking.service";
import { BookingStatus } from "../../common/enums/booking-status.enum";

@Controller("bookings")
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}
  @Post()
  createBooking(@Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(dto);
  }

  @Get()
  getAllBookings(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("equipmentId") equipmentId?: string,
    @Query("userId") userId?: string,
    @Query("status") status?: BookingStatus,
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

    return this.bookingService.getAllBookings(page, limit, equipmentId, userId, status);

  }

  @Get(":id")
  getBookingById(@Param("id") id: string) {
    return this.bookingService.getBookingById(id);
  }

  @Patch(":id")
  updateBooking(
    @Param("id") id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingService.updateBooking(id, dto);
  }

  @Delete(":id")
  deleteBooking(@Param("id") id: string) {
    return this.bookingService.deleteBooking(id);
  }
}
