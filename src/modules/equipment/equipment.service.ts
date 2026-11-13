import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";

import { CreateEquipmentDto } from "./dto/create-equipment.dto";
import { UpdateEquipmentDto } from "./dto/update-equipment.dto";

import { Equipment } from "./entities/equipment.entity";
import { EquipmentStatus } from "../../common/enums/equipment-status.enum";

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  async createEquipment(dto: CreateEquipmentDto) {
    const equipment = this.equipmentRepository.create(dto);

    return await this.equipmentRepository.save(equipment);
  }

  async getAllEquipment(
    page: number,
    limit: number,
    labId?: string,
    status?: EquipmentStatus,
  ) {
    const [equipment, total] = await this.equipmentRepository.findAndCount({
      where: {
        ...(labId ? { labId } : {}),
        ...(status ? { status } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: equipment,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getEquipmentById(id: string) {
    const equipment = await this.equipmentRepository.findOne({
      where: { equipmentId: id },
    });
    if (!equipment) {
      throw new NotFoundException("Equipment not found");
    }
    return equipment;
  }
  async updateEquipment(id: string, dto: UpdateEquipmentDto) {
    const equipment = await this.equipmentRepository.findOne({
      where: { equipmentId: id },
    });

    if (!equipment) {
      throw new NotFoundException("Equipment not found");
    }

    Object.assign(equipment, dto);
    return await this.equipmentRepository.save(equipment);
  }

  async deleteEquipment(id: string) {
    const equipment = await this.equipmentRepository.findOne({
      where: { equipmentId: id },
    });

    if (!equipment) {
      throw new NotFoundException("Equipment not found");
    }

    try {
      await this.equipmentRepository.delete(id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === "23503"
      ) {
        throw new ConflictException(
          "Equipment has rules, maintenance tickets or bookings and cannot be deleted",
        );
      }
      throw error;
    }
    return { message: "Equipment deleted successfully" };
  }
}
