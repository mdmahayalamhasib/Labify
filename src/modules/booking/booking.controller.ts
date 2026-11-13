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

import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { BookingService } from "./booking.service";
import { BookingStatus } from "../../common/enums/booking-status.enum";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthUser } from "../../common/interfaces/auth-user.interface";

@Controller("bookings")
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}
  @Post()
  createBooking(@Body() dto: CreateBookingDto, @CurrentUser() user: AuthUser) {
    return this.bookingService.createBooking(dto, user);
  }

  @Get()
  getAllBookings(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("equipmentId", new ParseUUIDPipe({ optional: true })) equipmentId?: string,
    @Query("userId", new ParseUUIDPipe({ optional: true })) userId?: string,
    @Query("status", new ParseEnumPipe(BookingStatus, { optional: true })) status?: BookingStatus,
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
  getBookingById(@Param("id", ParseUUIDPipe) id: string) {
    return this.bookingService.getBookingById(id);
  }

  @Patch(":id")
  updateBooking(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.bookingService.updateBooking(id, dto, user);
  }

  @Delete(":id")
  deleteBooking(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.bookingService.deleteBooking(id, user);
  }
}
