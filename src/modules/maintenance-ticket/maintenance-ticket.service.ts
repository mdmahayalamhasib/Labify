import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateMaintenanceTicketDto } from "./dto/create-maintenance-ticket.dto";
import { UpdateMaintenanceTicketDto } from "./dto/update-maintenance-ticket.dto";

import { MaintenanceTicket } from "./entities/maintenance-ticket.entity";
import { Equipment } from "../equipment/entities/equipment.entity";
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
  ) {}

  async createMaintenanceTicket(dto: CreateMaintenanceTicketDto, user: AuthUser) {
    const equipment = await this.equipmentRepository.findOne({
      where: { equipmentId: dto.equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException("Equipment not found");
    }

    const ticket = this.maintenanceTicketRepository.create({
      ...dto,
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

    Object.assign(ticket, dto);

    if (
      (ticket.status === MaintenanceStatus.RESOLVED ||
        ticket.status === MaintenanceStatus.CLOSED) &&
      !ticket.resolvedAt
    ) {
      ticket.resolvedAt = new Date();
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

  private isStaff(user: AuthUser) {
    return (
      user.roles.includes(AccountRole.ADMIN) ||
      user.roles.includes(AccountRole.LAB_OWNER)
    );
  }
}
