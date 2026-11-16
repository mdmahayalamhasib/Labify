import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { In, LessThan, MoreThan, Repository } from "typeorm";

import { CreateMaintenanceTicketDto } from "./dto/create-maintenance-ticket.dto";
import { UpdateMaintenanceTicketDto } from "./dto/update-maintenance-ticket.dto";

import { MaintenanceTicket } from "./entities/maintenance-ticket.entity";
import { Equipment } from "../equipment/entities/equipment.entity";
import { Booking } from "../booking/entities/booking.entity";
import { BookingStatus } from "../../common/enums/booking-status.enum";
import { MaintenanceStatus } from "../../common/enums/maintenance-status.enum";
import { AccountRole } from "../../common/enums/account-role.enum";
import { AuthUser } from "../../common/interfaces/auth-user.interface";

@Injectable()
export class MaintenanceTicketService {
  constructor(
    @InjectRepository(MaintenanceTicket)
    private readonly maintenanceTicketRepository: Repository<MaintenanceTicket>,

    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,

    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async createMaintenanceTicket(dto: CreateMaintenanceTicketDto, user: AuthUser) {
    const equipment = await this.equipmentRepository.findOne({
      where: { equipmentId: dto.equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException("Equipment not found");
    }

    const hasDowntime = dto.downtimeStart != null || dto.downtimeEnd != null;

    if (hasDowntime && !this.isStaff(user)) {
      throw new ForbiddenException(
        "Only a lab owner or admin can schedule maintenance downtime",
      );
    }

    const downtimeStart = dto.downtimeStart ? new Date(dto.downtimeStart) : null;
    const downtimeEnd = dto.downtimeEnd ? new Date(dto.downtimeEnd) : null;
    this.assertValidDowntime(downtimeStart, downtimeEnd);
    await this.assertNoBookingConflict(
      dto.equipmentId,
      downtimeStart,
      downtimeEnd,
      MaintenanceStatus.OPEN,
    );

    const ticket = this.maintenanceTicketRepository.create({
      ...dto,
      downtimeStart,
      downtimeEnd,
      reportedById: user.id,
    });

    return await this.maintenanceTicketRepository.save(ticket);
  }

  async getAllMaintenanceTickets(
    page: number,
    limit: number,
    equipmentId?: string,
    status?: MaintenanceStatus,
  ) {
    const [tickets, total] = await this.maintenanceTicketRepository.findAndCount({
      where: {
        ...(equipmentId ? { equipmentId } : {}),
        ...(status ? { status } : {}),
      },
      relations: {
        equipment: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: tickets,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getMaintenanceTicketById(id: string) {
    const ticket = await this.maintenanceTicketRepository.findOne({
      where: { ticketId: id },
      relations: {
        equipment: true,
      },
    });
    if (!ticket) {
      throw new NotFoundException("Maintenance ticket not found");
    }
    return ticket;
  }
  async updateMaintenanceTicket(
    id: string,
    dto: UpdateMaintenanceTicketDto,
    user: AuthUser,
  ) {
    const ticket = await this.maintenanceTicketRepository.findOne({
      where: { ticketId: id },
    });

    if (!ticket) {
      throw new NotFoundException("Maintenance ticket not found");
    }

    const isStaff = this.isStaff(user);

    if (!isStaff && ticket.reportedById !== user.id) {
      throw new ForbiddenException("You can only modify tickets you reported");
    }

    if (!isStaff && dto.status) {
      throw new ForbiddenException(
        "Only a lab owner or admin can change a ticket's status",
      );
    }

    const { downtimeStart, downtimeEnd, ...rest } = dto;

    if (
      !isStaff &&
      (downtimeStart !== undefined || downtimeEnd !== undefined)
    ) {
      throw new ForbiddenException(
        "Only a lab owner or admin can schedule maintenance downtime",
      );
    }

    Object.assign(ticket, rest);

    if (downtimeStart !== undefined) {
      ticket.downtimeStart = downtimeStart ? new Date(downtimeStart) : null;
    }

    if (downtimeEnd !== undefined) {
      ticket.downtimeEnd = downtimeEnd ? new Date(downtimeEnd) : null;
    }

    this.assertValidDowntime(ticket.downtimeStart, ticket.downtimeEnd);

    await this.assertNoBookingConflict(
      ticket.equipmentId,
      ticket.downtimeStart,
      ticket.downtimeEnd,
      ticket.status,
    );

    if (
      (ticket.status === MaintenanceStatus.RESOLVED ||
        ticket.status === MaintenanceStatus.CLOSED) &&
      !ticket.resolvedAt
    ) {
      ticket.resolvedAt = new Date();
    } else if (
      dto.status &&
      (dto.status === MaintenanceStatus.OPEN ||
        dto.status === MaintenanceStatus.IN_PROGRESS)
    ) {
      ticket.resolvedAt = null;
    }

    return await this.maintenanceTicketRepository.save(ticket);
  }

  async deleteMaintenanceTicket(id: string, user: AuthUser) {
    const ticket = await this.maintenanceTicketRepository.findOne({
      where: { ticketId: id },
    });

    if (!ticket) {
      throw new NotFoundException("Maintenance ticket not found");
    }

    if (!this.isStaff(user) && ticket.reportedById !== user.id) {
      throw new ForbiddenException("You can only delete tickets you reported");
    }

    await this.maintenanceTicketRepository.delete(id);
    return { message: "Maintenance ticket deleted successfully" };
  }

  private assertValidDowntime(start?: Date | null, end?: Date | null) {
    if (end && !start) {
      throw new BadRequestException("downtimeEnd requires downtimeStart");
    }

    if (start && end && end <= start) {
      throw new BadRequestException("downtimeEnd must be after downtimeStart");
    }
  }

  private async assertNoBookingConflict(
    equipmentId: string,
    downtimeStart: Date | null | undefined,
    downtimeEnd: Date | null | undefined,
    status: MaintenanceStatus,
  ) {
    if (
      !downtimeStart ||
      (status !== MaintenanceStatus.OPEN &&
        status !== MaintenanceStatus.IN_PROGRESS)
    ) {
      return;
    }

    const booking = await this.bookingRepository.findOne({
      where: {
        equipmentId,
        status: In([BookingStatus.PENDING, BookingStatus.APPROVED]),
        ...(downtimeEnd ? { startTime: LessThan(downtimeEnd) } : {}),
        endTime: MoreThan(downtimeStart),
      },
    });

    if (booking) {
      throw new ConflictException(
        "Maintenance downtime overlaps an existing booking",
      );
    }
  }

  private isStaff(user: AuthUser) {
    return (
      user.roles.includes(AccountRole.ADMIN) ||
      user.roles.includes(AccountRole.LAB_OWNER)
    );
  }
}
