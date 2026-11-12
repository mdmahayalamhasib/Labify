import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateEquipmentRuleDto } from "./dto/create-equipment-rule.dto";
import { UpdateEquipmentRuleDto } from "./dto/update-equipment-rule.dto";

import { EquipmentRule } from "./entities/equipment-rule.entity";
import { Equipment } from "../equipment/entities/equipment.entity";

@Injectable()
export class EquipmentRuleService {
  constructor(
    @InjectRepository(EquipmentRule)
    private readonly equipmentRuleRepository: Repository<EquipmentRule>,

    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  async createEquipmentRule(dto: CreateEquipmentRuleDto) {
    const equipment = await this.equipmentRepository.findOne({
      where: { equipmentId: dto.equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException("Equipment not found");
    }

    const rule = this.equipmentRuleRepository.create(dto);

    return await this.equipmentRuleRepository.save(rule);
  }

  async getAllEquipmentRules(
    page: number,
    limit: number,
    equipmentId?: string,
  ) {
    const [rules, total] = await this.equipmentRuleRepository.findAndCount({
      where: {
        ...(equipmentId ? { equipmentId } : {}),
      },
      relations: {
        equipment: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: rules,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getEquipmentRuleById(id: string) {
    const rule = await this.equipmentRuleRepository.findOne({
      where: { ruleId: id },
      relations: {
        equipment: true,
      },
    });
    if (!rule) {
      throw new NotFoundException("Equipment rule not found");
    }
    return rule;
  }
  async updateEquipmentRule(id: string, dto: UpdateEquipmentRuleDto) {
    const rule = await this.equipmentRuleRepository.findOne({
      where: { ruleId: id },
    });

    if (!rule) {
      throw new NotFoundException("Equipment rule not found");
    }

    Object.assign(rule, dto);
    return await this.equipmentRuleRepository.save(rule);
  }

  async deleteEquipmentRule(id: string) {
    const rule = await this.equipmentRuleRepository.findOne({
      where: { ruleId: id },
    });

    if (!rule) {
      throw new NotFoundException("Equipment rule not found");
    }

    await this.equipmentRuleRepository.delete(id);
    return { message: "Equipment rule deleted successfully" };
  }
}
