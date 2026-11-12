import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { In, LessThan, MoreThan, Not, Repository } from "typeorm";

import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";

import { Booking } from "./entities/booking.entity";
import { Equipment } from "../equipment/entities/equipment.entity";
import { BookingStatus } from "../../common/enums/booking-status.enum";

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  async createBooking(dto: CreateBookingDto) {
    const equipment = await this.equipmentRepository.findOne({
      where: { equipmentId: dto.equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException("Equipment not found");
    }

    await this.assertValidSlot(
      dto.equipmentId,
      new Date(dto.startTime),
      new Date(dto.endTime),
    );

    const booking = this.bookingRepository.create(dto);

    return await this.bookingRepository.save(booking);
  }

  async getAllBookings(
    page: number,
    limit: number,
    equipmentId?: string,
    userId?: string,
    status?: BookingStatus,
  ) {
    const [bookings, total] = await this.bookingRepository.findAndCount({
      where: {
        ...(equipmentId ? { equipmentId } : {}),
        ...(userId ? { userId } : {}),
        ...(status ? { status } : {}),
      },
      relations: {
        equipment: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getBookingById(id: string) {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId: id },
      relations: {
        equipment: true,
      },
    });
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return booking;
  }
  async updateBooking(id: string, dto: UpdateBookingDto) {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId: id },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const startTime = dto.startTime ? new Date(dto.startTime) : booking.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : booking.endTime;

    if (dto.startTime || dto.endTime) {
      await this.assertValidSlot(booking.equipmentId, startTime, endTime, id);
    }

    Object.assign(booking, dto);
    return await this.bookingRepository.save(booking);
  }

  async deleteBooking(id: string) {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId: id },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    await this.bookingRepository.delete(id);
    return { message: "Booking deleted successfully" };
  }

  private async assertValidSlot(
    equipmentId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string,
  ) {
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new BadRequestException("Invalid startTime or endTime");
    }

    if (endTime <= startTime) {
      throw new BadRequestException("endTime must be after startTime");
    }

    const conflict = await this.bookingRepository.findOne({
      where: {
        equipmentId,
        status: In([BookingStatus.PENDING, BookingStatus.APPROVED]),
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
        ...(excludeBookingId ? { bookingId: Not(excludeBookingId) } : {}),
      },
    });

    if (conflict) {
      throw new ConflictException(
        "Equipment is already booked for this time slot",
      );
    }
  }
}
