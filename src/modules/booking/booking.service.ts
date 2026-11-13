import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { In, LessThan, MoreThan, Not, Repository } from "typeorm";

import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";

import { Booking } from "./entities/booking.entity";
import { Equipment } from "../equipment/entities/equipment.entity";
import { EquipmentRule } from "../equipment-rule/entities/equipment-rule.entity";
import { BookingStatus } from "../../common/enums/booking-status.enum";
import { EquipmentStatus } from "../../common/enums/equipment-status.enum";
import { AccountRole } from "../../common/enums/account-role.enum";
import { AuthUser } from "../../common/interfaces/auth-user.interface";

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,

    @InjectRepository(EquipmentRule)
    private readonly equipmentRuleRepository: Repository<EquipmentRule>,
  ) {}

  async createBooking(dto: CreateBookingDto, user: AuthUser) {
    const equipment = await this.equipmentRepository.findOne({
      where: { equipmentId: dto.equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException("Equipment not found");
    }

    if (equipment.status !== EquipmentStatus.AVAILABLE) {
      throw new BadRequestException("Equipment is not available for booking");
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    await this.assertValidSlot(dto.equipmentId, startTime, endTime);
    await this.assertRulesAllow(dto.equipmentId, startTime, endTime);

    const booking = this.bookingRepository.create({
      equipmentId: dto.equipmentId,
      userId: user.id,
      startTime,
      endTime,
      purpose: dto.purpose,
      status: equipment.requiresApproval
        ? BookingStatus.PENDING
        : BookingStatus.APPROVED,
    });

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
  async updateBooking(id: string, dto: UpdateBookingDto, user: AuthUser) {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId: id },
      relations: {
        equipment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const isStaff = this.isStaff(user);

    if (!isStaff && booking.userId !== user.id) {
      throw new ForbiddenException("You can only modify your own bookings");
    }

    if (!isStaff && dto.status && dto.status !== BookingStatus.CANCELLED) {
      throw new ForbiddenException(
        "Only a lab owner or admin can approve, reject or complete a booking",
      );
    }

    const startTime = dto.startTime ? new Date(dto.startTime) : booking.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : booking.endTime;
    const timesChanged = Boolean(dto.startTime || dto.endTime);

    if (timesChanged) {
      await this.assertValidSlot(booking.equipmentId, startTime, endTime, id);
      await this.assertRulesAllow(booking.equipmentId, startTime, endTime);
    }

    Object.assign(booking, dto);

    if (
      isStaff &&
      (dto.status === BookingStatus.APPROVED ||
        dto.status === BookingStatus.REJECTED)
    ) {
      booking.reviewedById = user.id;
    }

    if (
      !isStaff &&
      timesChanged &&
      booking.status === BookingStatus.APPROVED &&
      booking.equipment.requiresApproval
    ) {
      booking.status = BookingStatus.PENDING;
    }

    return await this.bookingRepository.save(booking);
  }

  async deleteBooking(id: string, user: AuthUser) {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId: id },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (!this.isStaff(user) && booking.userId !== user.id) {
      throw new ForbiddenException("You can only delete your own bookings");
    }

    await this.bookingRepository.delete(id);
    return { message: "Booking deleted successfully" };
  }

  private isStaff(user: AuthUser) {
    return (
      user.roles.includes(AccountRole.ADMIN) ||
      user.roles.includes(AccountRole.LAB_OWNER)
    );
  }

  private async assertRulesAllow(
    equipmentId: string,
    startTime: Date,
    endTime: Date,
  ) {
    const rules = await this.equipmentRuleRepository.find({
      where: { equipmentId, isActive: true },
    });

    const minutes = (endTime.getTime() - startTime.getTime()) / 60000;

    for (const rule of rules) {
      if (rule.maxBookingMinutes != null && minutes > rule.maxBookingMinutes) {
        throw new BadRequestException(
          `Booking exceeds the maximum of ${rule.maxBookingMinutes} minutes for this equipment`,
        );
      }

      if (
        rule.advanceBookingDays != null &&
        startTime.getTime() > Date.now() + rule.advanceBookingDays * 86400000
      ) {
        throw new BadRequestException(
          `This equipment can be booked at most ${rule.advanceBookingDays} days in advance`,
        );
      }
    }
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
