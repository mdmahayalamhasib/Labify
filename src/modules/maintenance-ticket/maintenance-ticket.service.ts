import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateMaintenanceTicketDto } from "./dto/create-maintenance-ticket.dto";
import { UpdateMaintenanceTicketDto } from "./dto/update-maintenance-ticket.dto";

import { MaintenanceTicket } from "./entities/maintenance-ticket.entity";
import { Equipment } from "../equipment/entities/equipment.entity";
import { MaintenanceStatus } from "../../common/enums/maintenance-status.enum";

@Injectable()
export class MaintenanceTicketService {
  constructor(
    @InjectRepository(MaintenanceTicket)
    private readonly maintenanceTicketRepository: Repository<MaintenanceTicket>,

    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  async createMaintenanceTicket(dto: CreateMaintenanceTicketDto) {
    const equipment = await this.equipmentRepository.findOne({
      where: { equipmentId: dto.equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException("Equipment not found");
    }

    const ticket = this.maintenanceTicketRepository.create(dto);

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
  async updateMaintenanceTicket(id: string, dto: UpdateMaintenanceTicketDto) {
    const ticket = await this.maintenanceTicketRepository.findOne({
      where: { ticketId: id },
    });

    if (!ticket) {
      throw new NotFoundException("Maintenance ticket not found");
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

  async deleteMaintenanceTicket(id: string) {
    const ticket = await this.maintenanceTicketRepository.findOne({
      where: { ticketId: id },
    });

    if (!ticket) {
      throw new NotFoundException("Maintenance ticket not found");
    }

    await this.maintenanceTicketRepository.delete(id);
    return { message: "Maintenance ticket deleted successfully" };
  }
}
